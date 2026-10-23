import urllib.parse

def generate_image(prompt: str) -> str:
    """
    Generate an image URL via Pollinations AI.
    Encodes the prompt and returns the direct image URL.
    """
    if not prompt or not prompt.strip():
        return ""

    encoded_prompt = urllib.parse.quote(prompt.strip())
    return f"https://image.pollinations.ai/prompt/{encoded_prompt}"
