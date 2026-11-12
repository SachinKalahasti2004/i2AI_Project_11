import time


class BlockedResponse(Exception):
    pass


class ModelError(Exception):
    pass


class Gemini:
    def __init__(self, model, api_key, schema, max_tokens):
        from google import genai
        from google.genai import errors, types

        self.client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=60_000))
        self.api_error = errors.APIError
        self.model = model
        self.config = {
            "temperature": 0,
            "max_output_tokens": max_tokens,
            "response_mime_type": "application/json",
            "response_json_schema": schema,
        }

    def generate(self, system, prompt):
        for attempt in range(3):
            try:
                result = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config={**self.config, "system_instruction": system},
                )
                break
            except self.api_error as exc:
                if exc.code not in {429, 500, 502, 503, 504} or attempt == 2:
                    raise ModelError(f"Gemini API returned HTTP {exc.code}") from None
            except (TimeoutError, ConnectionError):
                if attempt == 2:
                    raise ModelError("Gemini connection failed after three attempts") from None
            time.sleep(2 ** attempt)

        feedback = getattr(result.prompt_feedback, "block_reason", None)
        candidate = result.candidates[0] if result.candidates else None
        finish = getattr(candidate, "finish_reason", None)
        if feedback and feedback != "BLOCKED_REASON_UNSPECIFIED":
            raise BlockedResponse(str(feedback))
        if finish in {"SAFETY", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "RECITATION", "MODEL_ARMOR"}:
            raise BlockedResponse(str(finish))
        return result.text or "", getattr(result, "model_version", None)


class Checkpoint:
    def __init__(self, checkpoint, revision, device, max_tokens, instructions):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self.torch = torch
        self.max_tokens = max_tokens
        if device == "auto":
            device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(checkpoint, revision=revision)
        for system in instructions:
            try:
                rendered = self.tokenizer.apply_chat_template(
                    self.messages(system, "Template check"), tokenize=False, add_generation_prompt=True
                )
                if system not in rendered:
                    raise ValueError("template dropped the system message")
            except Exception as exc:
                raise ValueError("checkpoint needs a chat template that preserves system messages") from exc

        self.model = AutoModelForCausalLM.from_pretrained(
            checkpoint, revision=revision, torch_dtype="auto"
        ).to(device).eval()
        self.revision = getattr(self.model.config, "_commit_hash", None) or revision

    @staticmethod
    def messages(system, prompt):
        return [{"role": "system", "content": system}, {"role": "user", "content": prompt}]

    def generate(self, system, prompt):
        inputs = self.tokenizer.apply_chat_template(
            self.messages(system, prompt), tokenize=True, add_generation_prompt=True,
            return_dict=True, return_tensors="pt",
        ).to(self.device)
        with self.torch.inference_mode():
            output = self.model.generate(**inputs, do_sample=False, max_new_tokens=self.max_tokens)
        new_tokens = output[0, inputs.input_ids.shape[-1]:]
        return self.tokenizer.decode(new_tokens, skip_special_tokens=True), self.revision
