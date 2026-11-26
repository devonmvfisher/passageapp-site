/* Passage Lab: Periodic Table of Local AI - Physics & Interactive Engine
 * MIT License (c) 2026 Devon Fisher / Passage (passageapp.ca)
 * Clean-room memory-bandwidth roofline & GQA KV-cache engine.
 * Zero external dependencies, zero tracking, zero proprietary code copied.
 */
(function () {
  "use strict";

  const HARDWARE = [
    { id: "rtx-5090", name: "RTX 5090", short: "RTX 5090 32GB", group: "Discrete GPUs", vram: 32, bw: 1792, watts: 575, price: 1999, engine: "llama.cpp / vLLM", maxMulti: 8 },
    { id: "rtx-4090", name: "RTX 4090", short: "RTX 4090 24GB", group: "Discrete GPUs", vram: 24, bw: 1008, watts: 450, price: 1599, engine: "llama.cpp / vLLM", maxMulti: 8 },
    { id: "rtx-3090", name: "RTX 3090", short: "RTX 3090 24GB", group: "Discrete GPUs", vram: 24, bw: 936, watts: 350, price: 750, engine: "llama.cpp / ExLlamaV2", maxMulti: 8 },
    { id: "rtx-4080s", name: "RTX 4080 Super", short: "RTX 4080S 16GB", group: "Discrete GPUs", vram: 16, bw: 736, watts: 320, price: 999, engine: "llama.cpp / vLLM", maxMulti: 4 },
    { id: "rtx-4070tis", name: "RTX 4070 Ti Super", short: "RTX 4070 Ti S 16GB", group: "Discrete GPUs", vram: 16, bw: 672, watts: 285, price: 799, engine: "llama.cpp", maxMulti: 4 },
    { id: "rtx-4060", name: "RTX 4060", short: "RTX 4060 8GB", group: "Discrete GPUs", vram: 8, bw: 272, watts: 115, price: 299, engine: "llama.cpp / Ollama", maxMulti: 2 },
    { id: "rtx-3060", name: "RTX 3060 12GB", short: "RTX 3060 12GB", group: "Discrete GPUs", vram: 12, bw: 360, watts: 170, price: 240, engine: "llama.cpp / Ollama", maxMulti: 4 },
    { id: "rx-7900xtx", name: "Radeon RX 7900 XTX", short: "RX 7900 XTX 24GB", group: "Discrete GPUs", vram: 24, bw: 960, watts: 355, price: 899, engine: "llama.cpp (ROCm/Vulkan)", maxMulti: 4 },
    { id: "arc-b580", name: "Intel Arc B580", short: "Arc B580 12GB", group: "Discrete GPUs", vram: 12, bw: 456, watts: 190, price: 249, engine: "llama.cpp (SYCL/Vulkan)", maxMulti: 2 },
    { id: "h100-sxm", name: "NVIDIA H100 SXM", short: "H100 80GB SXM", group: "Discrete GPUs", vram: 80, bw: 3350, watts: 700, price: 28000, engine: "vLLM / SGLang", maxMulti: 8 },
    { id: "m4-pro-48", name: "MacBook Pro M4 Pro 48GB", short: "M4 Pro 48GB", group: "Unified Memory", vram: 36, bw: 273, watts: 45, price: 2399, engine: "MLX / llama.cpp", maxMulti: 1, unified: true },
    { id: "m4-max-128", name: "MacBook Pro M4 Max 128GB", short: "M4 Max 128GB", group: "Unified Memory", vram: 96, bw: 546, watts: 78, price: 4699, engine: "MLX / llama.cpp", maxMulti: 1, unified: true },
    { id: "m3-ultra-192", name: "Mac Studio M3 Ultra 192GB", short: "M3 Ultra 192GB", group: "Unified Memory", vram: 160, bw: 800, watts: 140, price: 5499, engine: "MLX / llama.cpp", maxMulti: 2, unified: true },
    { id: "m5-ultra-512", name: "Mac Studio M5 Ultra 512GB", short: "M5 Ultra 512GB", group: "Unified Memory", vram: 448, bw: 1200, watts: 185, price: 9499, engine: "MLX / llama.cpp", maxMulti: 2, unified: true },
    { id: "dgx-spark", name: "NVIDIA DGX Spark 128GB", short: "DGX Spark 128GB", group: "Unified Memory", vram: 112, bw: 273, watts: 170, price: 3999, engine: "vLLM / TensorRT-LLM", maxMulti: 2, unified: true },
    { id: "strix-halo", name: "AMD Strix Halo 128GB", short: "Strix Halo 128GB", group: "Unified Memory", vram: 96, bw: 256, watts: 120, price: 2299, engine: "llama.cpp (Vulkan/ROCm)", maxMulti: 1, unified: true },
    { id: "cpu-ddr5-32", name: "Desktop CPU DDR5 32GB", short: "CPU DDR5 32GB", group: "CPU Only", vram: 24, bw: 82, watts: 95, price: 650, engine: "llama.cpp (AVX-512)", maxMulti: 1, cpuOnly: true },
    { id: "cpu-laptop-16", name: "Laptop CPU 16GB", short: "Laptop 16GB CPU", group: "CPU Only", vram: 10, bw: 68, watts: 28, price: 999, engine: "llama.cpp / Ollama", maxMulti: 1, cpuOnly: true }
  ];

  const SHELLS = [
    { n: 1, name: "Pocket", cap: "up to 8 GB", ex: "Laptop, 8GB GPU", kind: "local" },
    { n: 2, name: "One GPU", cap: "up to 32 GB", ex: "RTX 3090 / 4090 / 5090", kind: "local" },
    { n: 3, name: "Spark Class", cap: "up to 128 GB", ex: "2-4x GPU, Spark, M4 Max", kind: "local" },
    { n: 4, name: "Workstation", cap: "up to 512 GB", ex: "M5 Ultra, GPU Tower", kind: "local" },
    { n: 5, name: "Rack", cap: "512 GB+", ex: "8x H100 / Multi-Node", kind: "local" },
    { n: 6, name: "Cloud Fast", cap: "Hosted API", ex: "Low-latency workhorse", kind: "cloud" },
    { n: 7, name: "Cloud Vault", cap: "Hosted API", ex: "Flagship closed models", kind: "cloud" }
  ];

  const FAMILIES = [
    { id: "qw", lab: "Alibaba", line: "Qwen", region: "CN" },
    { id: "ds", lab: "DeepSeek", line: "DeepSeek", region: "CN" },
    { id: "gl", lab: "Zhipu", line: "GLM", region: "CN" },
    { id: "nv", lab: "NVIDIA", line: "Nemotron", region: "US" },
    { id: "go", lab: "Google", line: "Gemma / Gemini", region: "US" },
    { id: "me", lab: "Meta", line: "Llama / Muse", region: "US" },
    { id: "ms", lab: "Microsoft", line: "Phi / MAI", region: "US" },
    { id: "oa", lab: "OpenAI", line: "gpt-oss / GPT", region: "US" },
    { id: "ki", lab: "Moonshot", line: "Kimi", region: "CN" },
    { id: "mx", lab: "MiniMax", line: "MiniMax", region: "CN" },
    { id: "xa", lab: "xAI", line: "Grok", region: "US" },
    { id: "an", lab: "Anthropic", line: "Claude", region: "US" }
  ];

  const MODELS = [
    { id: "qwen35-4b", atomic: 1, sym: "Qs", name: "Qwen3.5-4B", family: "qw", shell: 1, kind: "local", totalB: 4.0, activeB: 4.0, arch: "Dense", layers: 36, kvHeads: 4, headDim: 128, maxCtx: 131072, license: "Apache-2.0", released: "2026", hf: "Qwen/Qwen3.5-4B-Instruct", isotopes: ["Qwen3-4B (2025)", "Qwen2.5-3B (2024)"], note: "Fast Apache-2.0 pocket model; fits inside 4 GB VRAM with generous context." },
    { id: "gemma4-4b", atomic: 2, sym: "Gs", name: "Gemma 4 4B", family: "go", shell: 1, kind: "local", totalB: 4.0, activeB: 4.0, arch: "Dense", layers: 34, kvHeads: 4, headDim: 256, maxCtx: 131072, license: "Apache-2.0", released: "Apr 2026", hf: "google/gemma-4-4b-it", isotopes: ["Gemma 4 2B (Apr 2026)", "Gemma 3 4B (2025)"], note: "Apache-2.0 multimodal pocket element built for phones and entry 8 GB cards." },
    { id: "phi4-mini", atomic: 3, sym: "Pm", name: "Phi-4-mini", family: "ms", shell: 1, kind: "local", totalB: 3.8, activeB: 3.8, arch: "Dense", layers: 32, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "MIT", released: "2025", hf: "microsoft/Phi-4-mini-instruct", isotopes: ["Phi-3.5-mini (2024)"], note: "MIT-licensed compact reasoning element tuned for laptop CPUs and light GPUs." },
    { id: "llama31-8b", atomic: 4, sym: "Ll", name: "Llama 3.1 8B", family: "me", shell: 1, kind: "local", totalB: 8.0, activeB: 8.0, arch: "Dense", layers: 32, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "Llama Community", released: "2024", hf: "meta-llama/Llama-3.1-8B-Instruct", isotopes: ["Llama 3.2 3B (2024)"], note: "Ubiquitous 8B reference baseline supported by every GGUF, MLX, and CUDA runtime." },

    { id: "qwen38-27b", atomic: 5, sym: "Qw", name: "Qwen3.8-27B", family: "qw", shell: 2, kind: "local", totalB: 27.0, activeB: 27.0, arch: "Dense", layers: 64, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "Apache-2.0", released: "2026", hf: "Qwen/Qwen3.8-27B-Instruct", isotopes: ["Qwen3.6-35B-A3B (Apr 2026)", "Qwen3-32B (2025)"], note: "Dense 27B single-GPU workhorse (~16 GB at Q4_K_M). Fits a single 24 GB card cleanly." },
    { id: "qwen36-35b-a3b", atomic: 6, sym: "Qa", name: "Qwen3.6-35B-A3B", family: "qw", shell: 2, kind: "local", totalB: 35.0, activeB: 3.0, arch: "MoE", layers: 48, kvHeads: 4, headDim: 128, maxCtx: 131072, license: "Apache-2.0", released: "Apr 2026", hf: "Qwen/Qwen3.6-35B-A3B", isotopes: ["Qwen3-30B-A3B (2025)"], note: "Sparse 3B-active MoE: holds 35B weights in one 24 GB card while decoding at 3B speed." },
    { id: "gemma4-31b", atomic: 7, sym: "Ge", name: "Gemma 4 31B", family: "go", shell: 2, kind: "local", totalB: 31.0, activeB: 31.0, arch: "Dense", layers: 62, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "Apache-2.0", released: "Apr 2026", hf: "google/gemma-4-31b-it", isotopes: ["Gemma 4 26B-A4B (Apr 2026)", "Gemma 4 12B (Apr 2026)"], note: "High-density Apache-2.0 31B model (~18 GB at Q4) for 24-32 GB cards." },
    { id: "nemotron35-light", atomic: 8, sym: "Nl", name: "Nemotron 3.5 Lightning", family: "nv", shell: 2, kind: "local", totalB: 30.0, activeB: 3.0, arch: "MoE", layers: 48, kvHeads: 4, headDim: 128, maxCtx: 131072, license: "OpenMDW", released: "2026", hf: "nvidia/Nemotron-3.5-Lightning-30B-A3B", isotopes: ["Nemotron-4-Mini (2025)"], note: "30B total / 3B active MoE built for extreme single-stream tok/s on consumer CUDA." },
    { id: "phi4-14b", atomic: 9, sym: "Ph", name: "Phi-4 14B", family: "ms", shell: 2, kind: "local", totalB: 14.7, activeB: 14.7, arch: "Dense", layers: 40, kvHeads: 10, headDim: 128, maxCtx: 16384, license: "MIT", released: "2025", hf: "microsoft/phi-4", isotopes: ["Phi-3-medium (2024)"], note: "MIT-licensed 14B STEM and coding puncher suited to 12-16 GB cards." },
    { id: "gpt-oss-20b", atomic: 10, sym: "Os", name: "gpt-oss-20b", family: "oa", shell: 2, kind: "local", totalB: 21.0, activeB: 3.6, arch: "MoE", layers: 24, kvHeads: 8, headDim: 64, maxCtx: 131072, license: "Apache-2.0", released: "2025", hf: "openai/gpt-oss-20b", isotopes: ["gpt-oss-20b MXFP4 (2025)"], note: "OpenAI's Apache-2.0 sparse MoE (3.6B active) tailored for fast single-GPU inference." },

    { id: "llama4-scout", atomic: 11, sym: "Ls", name: "Llama 4 Scout", family: "me", shell: 3, kind: "local", totalB: 109.0, activeB: 17.0, arch: "MoE", layers: 48, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Llama Community", released: "2025", hf: "meta-llama/Llama-4-Scout-17B-16E-Instruct", isotopes: ["Llama 3.3 70B (2024)"], note: "109B total / 17B active MoE (~65 GB Q4); built for DGX Spark, M4 Max 128 GB, or 3x 24 GB GPUs." },
    { id: "gpt-oss-120b", atomic: 12, sym: "Go", name: "gpt-oss-120b", family: "oa", shell: 3, kind: "local", totalB: 117.0, activeB: 5.1, arch: "MoE", layers: 36, kvHeads: 8, headDim: 64, maxCtx: 131072, license: "Apache-2.0", released: "2025", hf: "openai/gpt-oss-120b", isotopes: ["gpt-oss-120b MXFP4 (2025)"], note: "Only 5.1B active parameters per token: decodes fast on 80-128 GB unified or H100 nodes." },
    { id: "nemotron3-super", atomic: 13, sym: "Ns", name: "Nemotron 3 Super", family: "nv", shell: 3, kind: "local", totalB: 120.0, activeB: 12.0, arch: "MoE", layers: 52, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "OpenMDW", released: "Mar 2026", hf: "nvidia/Nemotron-3-Super-120B", isotopes: ["Llama-3.1-Nemotron-70B (2024)"], note: "120B Spark-class hybrid model tuned for multi-GPU workstations." },

    { id: "deepseek-v41-flash", atomic: 14, sym: "Df", name: "DeepSeek V4.1-Flash", family: "ds", shell: 4, kind: "local", totalB: 284.0, activeB: 13.0, arch: "MoE", layers: 61, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "MIT", released: "Oct 2026", hf: "deepseek-ai/DeepSeek-V4.1-Flash", isotopes: ["DeepSeek V4-Flash (Apr 2026)", "DeepSeek-R1 (2025)"], note: "MIT-licensed sparse MoE (~169 GB Q4, 13B active). High speed on M3/M5 Ultra or multi-GPU towers." },
    { id: "qwen35-397b", atomic: 15, sym: "Qx", name: "Qwen3.5-397B", family: "qw", shell: 4, kind: "local", totalB: 397.0, activeB: 17.0, arch: "MoE", layers: 64, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Apache-2.0", released: "Feb 2026", hf: "Qwen/Qwen3.5-397B-A17B", isotopes: ["Qwen3-235B-A22B (2025)"], note: "Apache-2.0 workstation flagship (17B active, ~237 GB Q4)." },
    { id: "llama4-maverick", atomic: 16, sym: "Lv", name: "Llama 4 Maverick", family: "me", shell: 4, kind: "local", totalB: 400.0, activeB: 17.0, arch: "MoE", layers: 48, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Llama Community", released: "2025", hf: "meta-llama/Llama-4-Maverick-17B-128E", isotopes: ["Llama 3.1 405B (2024)"], note: "128-expert 400B MoE (17B active) for 512 GB unified machines or 4x H100 nodes." },
    { id: "minimax-m3", atomic: 17, sym: "Mx", name: "MiniMax M3", family: "mx", shell: 4, kind: "local", totalB: 428.0, activeB: 23.0, arch: "MoE", layers: 64, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Open Weights", released: "Jun 2026", hf: "MiniMaxAI/MiniMax-M3", isotopes: ["MiniMax M2.5 (2025)"], note: "Long-context 428B MoE (23B active) built for agentic loops on 512 GB rigs." },
    { id: "glm-53", atomic: 18, sym: "Gl", name: "GLM-5.3", family: "gl", shell: 4, kind: "local", totalB: 753.0, activeB: 40.0, arch: "MoE", layers: 80, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "MIT", released: "Aug 2026", hf: "zai-org/GLM-5.3", isotopes: ["GLM-5.2 (Jun 2026)", "GLM-5 (Feb 2026)"], note: "MIT-licensed 753B MoE (40B active); tight fit at 512 GB unified or 8x H100." },
    { id: "nemotron3-ultra", atomic: 19, sym: "Nu", name: "Nemotron 3 Ultra", family: "nv", shell: 4, kind: "local", totalB: 550.0, activeB: 55.0, arch: "MoE", layers: 80, kvHeads: 8, headDim: 128, maxCtx: 131072, license: "OpenMDW", released: "2026", hf: "nvidia/Nemotron-3-Ultra-550B", isotopes: ["Nemotron-4 340B (2024)"], note: "NVIDIA OpenMDW 550B reasoning tower (55B active) for 512 GB+ workstations." },

    { id: "deepseek-v4-pro", atomic: 20, sym: "Dp", name: "DeepSeek V4-Pro", family: "ds", shell: 5, kind: "local", totalB: 1600.0, activeB: 48.0, arch: "MoE", layers: 96, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "MIT", released: "Apr 2026", hf: "deepseek-ai/DeepSeek-V4-Pro", isotopes: ["DeepSeek-V3.2 (2025)"], note: "MIT-licensed 1.6T rack-scale open frontier weights (48B active)." },
    { id: "kimi-k3", atomic: 21, sym: "Ki", name: "Kimi K3", family: "ki", shell: 5, kind: "local", totalB: 2800.0, activeB: 64.0, arch: "MoE", layers: 96, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Open Weights", released: "Jul 2026", hf: "moonshotai/Kimi-K3", isotopes: ["Kimi K3.1 Pro (Oct 2026)"], note: "2.8T open-weight rack titan (~1.6 TB Q4); multi-node cluster scale." },
    { id: "qwen38-open", atomic: 22, sym: "Qg", name: "Qwen3.8 Flagship", family: "qw", shell: 5, kind: "local", totalB: 2400.0, activeB: 95.0, arch: "MoE", layers: 96, kvHeads: 8, headDim: 128, maxCtx: 262144, license: "Apache-2.0", released: "Aug 2026", hf: "Qwen/Qwen3.8-Open-2.4T", isotopes: ["Qwen3.5-397B (Feb 2026)"], note: "Rack-scale Apache-2.0 flagship (95B active per token)." },

    { id: "gemini4-h", atomic: 23, sym: "H", name: "Gemini 4 Hydrogen", family: "go", shell: 6, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Nov 2026", isotopes: ["Gemini 3.5 Flash (2026)"], note: "Google's high-speed everyday coding & agent element; hosted API only." },
    { id: "gemini4-ne", atomic: 24, sym: "Ne", name: "Gemini 4 Neon", family: "go", shell: 6, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Nov 2026", isotopes: ["Gemini 3.1 Pro (2026)"], note: "Balanced frontier coding & multimodal element; weights stay with Google." },
    { id: "gpt6-luna", atomic: 25, sym: "Lu", name: "GPT-6 Luna", family: "oa", shell: 6, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Sep 2026", isotopes: ["GPT-5.6 Luna (2026)"], note: "Fast hosted OpenAI tier; below the custody boundary." },
    { id: "claude-so", atomic: 26, sym: "So", name: "Claude Sonnet 5.5", family: "an", shell: 6, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Sep 2026", isotopes: ["Claude Sonnet 5 (Jul 2026)", "Claude Haiku 5.5 (Oct 2026)"], note: "Anthropic hosted workhorse; lab holds the weights." },

    { id: "gemini4-c", atomic: 27, sym: "C", name: "Gemini 4 Carbon", family: "go", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Nov 2026", isotopes: ["Gemini 4 Argon (Oct 2026)"], note: "Google's flagship deep-reasoning element; hosted API only." },
    { id: "gpt62-sol", atomic: 28, sym: "Sl", name: "GPT-6.2 Sol", family: "oa", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Nov 2026", isotopes: ["GPT-6.2 Astra (Nov 2026)", "GPT-6.1 Terra (Oct 2026)"], note: "OpenAI hosted flagship reasoning element." },
    { id: "grok-46", atomic: 29, sym: "Gk", name: "Grok 4.6", family: "xa", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Aug 2026", isotopes: ["Grok 4.5 (2026)", "Grok Build 0.1 (2026)"], note: "xAI hosted frontier element." },
    { id: "claude-op", atomic: 30, sym: "Op", name: "Claude Opus 5.5", family: "an", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Sep 2026", isotopes: ["Claude Opus 5 (Jul 2026)", "Claude Fable 5.2 (Nov 2026)"], note: "Anthropic hosted flagship reasoning element." },
    { id: "muse-wonder", atomic: 31, sym: "Wo", name: "Muse Wonder", family: "me", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Oct 2026", isotopes: ["Muse Spark 1.3 (2026)"], note: "Meta's closed hosted tier above open Llama 4 weights." },
    { id: "mai-thinking", atomic: 32, sym: "Ma", name: "MAI-Thinking-1", family: "ms", shell: 7, kind: "cloud", totalB: null, activeB: null, arch: "Hosted API", license: "Proprietary", released: "Aug 2026", isotopes: ["Microsoft Foundry Preview (2026)"], note: "Microsoft hosted reasoning tier." }
  ];

  const COMPOUNDS = [
    { id: "budget-8gb", name: "Air-Gapped 8 GB Pocket Rig", tier: "Starter", hwId: "rtx-4060", gpus: 1, quant: 4.5, elements: ["qwen35-4b", "gemma4-4b", "phi4-mini"], formula: ["Qs", "Gs", "Pm"], cost: "~$299 GPU · 115W", desc: "Apache-2.0 and MIT pocket models running completely offline on an 8 GB RTX 4060 or thin laptop." },
    { id: "single-24gb", name: "Used 3090 Privacy Foundry", tier: "Sweet Spot", hwId: "rtx-3090", gpus: 1, quant: 4.5, elements: ["qwen38-27b", "qwen36-35b-a3b", "gemma4-31b", "gpt-oss-20b"], formula: ["Qw", "Qa", "Ge", "Os"], cost: "~$750 used GPU · 350W", desc: "Best value per GB of VRAM: dense 27B-31B reasoning plus 3B-active MoE speed under one roof." },
    { id: "dual-3090", name: "Dual-3090 Coding Tower", tier: "Pro Local", hwId: "rtx-3090", gpus: 2, quant: 4.5, elements: ["qwen38-27b", "llama4-scout", "gpt-oss-120b", "nemotron3-super"], formula: ["Qw", "Ls", "Go", "Ns"], cost: "~$1,500 dual GPU · 700W", desc: "48 GB VRAM pool unlocks Q8 27B coding precision or 109B-120B sparse MoE partial offload." },
    { id: "mac-ultra", name: "Silent 512 GB Unified Studio", tier: "Workstation", hwId: "m5-ultra-512", gpus: 1, quant: 4.5, elements: ["deepseek-v41-flash", "qwen35-397b", "llama4-maverick", "glm-53"], formula: ["Df", "Qx", "Lv", "Gl"], cost: "M5 Ultra 512GB · 185W", desc: "Holds 284B-753B frontier MoE weights in quiet unified memory under 200 watts." },
    { id: "hybrid-custody", name: "Local Draft + Cloud Escalation", tier: "Hybrid", hwId: "rtx-4090", gpus: 1, quant: 4.5, elements: ["qwen38-27b", "gpt-oss-20b", "gemini4-c", "claude-op"], formula: ["Qw", "Os", "C", "Op"], cost: "Local metal + Cloud vault", desc: "Keep private logs and rapid loops above the custody line; cross into Shell 7 only when stakes demand frontier depth." }
  ];

  function multiEfficiency(g) {
    if (g <= 1) return 0.78;
    if (g === 2) return 0.72;
    if (g === 3) return 0.68;
    if (g === 4) return 0.65;
    if (g <= 6) return 0.61;
    return 0.58;
  }

  function computeRoofline(p) {
    const gpus = p.gpus || 1;
    const overheadGb = p.overheadGb != null ? p.overheadGb : 1.5;
    const totalVram = p.vramPerGpu * gpus;
    const usableVram = Math.max(1, totalVram - overheadGb);
    const aggBw = p.bwPerGpu * gpus;
    const effFactor = p.cpuOnly ? 0.62 : multiEfficiency(gpus);
    const effBw = aggBw * effFactor;
    const bits = p.weightBits || 4.5;

    const weightGb = p.totalB * (bits / 8) * 1.06;
    const activeGb = Math.min(p.totalB, p.activeB || p.totalB) * (bits / 8) * 1.05;
    const kvPerStreamGb = (2 * (p.layers || 48) * (p.kvHeads || 8) * (p.headDim || 128) * (p.ctxTokens || 32768) * (p.kvBytes || 2)) / (1024 * 1024 * 1024);
    const draftGb = p.speculative ? 1.4 : 0;
    const baseNeededGb = weightGb + kvPerStreamGb + draftGb;

    let fitStatus = "fits";
    let effectiveDecodeBw = effBw;
    let offloadRatio = 0;

    if (baseNeededGb <= usableVram) {
      fitStatus = "fits";
    } else if (baseNeededGb <= usableVram * 1.65 && !p.cpuOnly) {
      fitStatus = "offload";
      offloadRatio = (baseNeededGb - usableVram) / baseNeededGb;
      effectiveDecodeBw = 1 / (((1 - offloadRatio) / effBw) + (offloadRatio / 65));
    } else {
      fitStatus = "exceeds";
      offloadRatio = Math.max(0.5, (baseNeededGb - usableVram) / baseNeededGb);
      effectiveDecodeBw = Math.min(65, 1 / ((0.1 / effBw) + (0.9 / 65)));
    }

    const kvReadGb = kvPerStreamGb * 0.35;
    let batch1Tok = effectiveDecodeBw / Math.max(0.25, activeGb + kvReadGb);
    if (p.speculative && fitStatus === "fits") {
      batch1Tok *= (1 + (p.draftAccept || 0.65) * 1.15);
    }

    let maxStreams = fitStatus === "offload" ? 1 : 0;
    let perStreamTok = batch1Tok;
    let aggBatchedTok = batch1Tok;

    if (fitStatus === "fits") {
      const freeForKv = Math.max(0, usableVram - weightGb - draftGb);
      const memMax = kvPerStreamGb > 0 ? Math.floor(freeForKv / kvPerStreamGb) : 64;
      let best = 1;
      for (let b = 1; b <= Math.min(64, Math.max(1, memMax)); b++) {
        const stepBytes = activeGb + kvReadGb * b;
        const computeFactor = 1 / (1 + (b - 1) * 0.045);
        const totalAgg = (effBw / stepBytes) * b * computeFactor;
        const perUser = totalAgg / b;
        if (perUser >= (p.minTokPerSec || 18) || b === 1) {
          best = b;
          perStreamTok = perUser;
          aggBatchedTok = totalAgg;
        } else {
          break;
        }
      }
      maxStreams = Math.max(1, best);
    }

    return {
      totalVram, usableVram, aggBw, effBw, effFactor, weightGb, kvPerStreamGb, draftGb, overheadGb,
      baseNeededGb, freeGb: Math.max(0, totalVram - (weightGb + kvPerStreamGb + draftGb + overheadGb)),
      fitStatus, offloadRatio,
      batch1Tok: Number(batch1Tok.toFixed(1)),
      maxStreams,
      perStreamTok: Number(perStreamTok.toFixed(1)),
      aggBatchedTok: Number(aggBatchedTok.toFixed(1))
    };
  }

  const state = {
    tab: "periodic",
    hwId: "rtx-3090",
    gpus: 1,
    quant: 4.5,
    selectedModelId: "qwen38-27b",
    activeCompoundId: null,
    hwSearch: "",
    hwMulti: {},
    cliEngine: "llamacpp",
    calc: {
      hwId: "rtx-3090", gpus: 1, vram: 24, bw: 936, overhead: 1.5,
      modelId: "qwen38-27b", totalB: 27, activeB: 27, layers: 64, kvHeads: 8, headDim: 128,
      bits: 4.5, ctx: 32768, kvBytes: 2, minTok: 18, speculative: false, draftAccept: 0.65
    }
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const getHw = (id) => HARDWARE.find((h) => h.id === id) || HARDWARE[0];
  const getModel = (id) => MODELS.find((m) => m.id === id) || MODELS[0];
  const qLabel = (b) => (b <= 4.6 ? "Q4_K_M" : b <= 6.6 ? "Q6_K" : b <= 8.1 ? "Q8_0" : "FP16");

  function toast(msg) {
    const t = $("#p-toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._id);
    toast._id = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function copyCmd(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("Copied " + label), () => fallbackCopy(text, label));
    } else {
      fallbackCopy(text, label);
    }
  }
  function fallbackCopy(text, label) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied " + label); } catch (_) { toast("Copy manually"); }
    document.body.removeChild(ta);
  }

  function syncCalc() {
    const hw = getHw(state.hwId);
    state.calc.hwId = hw.id;
    state.calc.gpus = state.gpus;
    state.calc.vram = hw.vram;
    state.calc.bw = hw.bw;
    state.calc.bits = state.quant;
  }

  function evalModel(m, hw, gpus, bits, ctx = 16384) {
    if (m.kind === "cloud") return { cloud: true, fitStatus: "cloud" };
    return computeRoofline({
      vramPerGpu: hw.vram, bwPerGpu: hw.bw, gpus, overheadGb: 1.5,
      totalB: m.totalB, activeB: m.activeB, weightBits: bits,
      layers: m.layers, kvHeads: m.kvHeads, headDim: m.headDim,
      ctxTokens: ctx, kvBytes: 2, minTokPerSec: 18, cpuOnly: !!hw.cpuOnly
    });
  }

  function populateHw(el) {
    const groups = ["Discrete GPUs", "Unified Memory", "CPU Only"];
    el.innerHTML = groups.map((g) => {
      const list = HARDWARE.filter((h) => h.group === g);
      return '<optgroup label="' + esc(g) + '">' +
        list.map((h) => '<option value="' + h.id + '">' + esc(h.name) + " (" + h.vram + " GB · " + h.bw + " GB/s)</option>").join("") +
        "</optgroup>";
    }).join("");
  }

  function renderGpuPills(container, hw, current, onPick) {
    const allowed = [1, 2, 3, 4, 6, 8].filter((n) => n <= (hw.maxMulti || 1));
    if (!allowed.includes(current)) current = allowed[allowed.length - 1] || 1;
    container.innerHTML = allowed.map((n) =>
      '<button type="button" class="p-pill' + (n === current ? " active" : "") + '" data-g="' + n + '">' + n + "x</button>"
    ).join("");
    container.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => onPick(Number(b.dataset.g))));
    return current;
  }

  function renderQuantPills(container, current, onPick) {
    const opts = [{ v: 4.5, l: "Q4_K_M" }, { v: 8, l: "Q8_0" }, { v: 16, l: "FP16" }];
    container.innerHTML = opts.map((o) =>
      '<button type="button" class="p-pill' + (Math.abs(o.v - current) < 0.2 ? " active" : "") + '" data-q="' + o.v + '">' + o.l + "</button>"
    ).join("");
    container.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => onPick(Number(b.dataset.q))));
  }

  function switchTab(tab) {
    state.tab = tab;
    $$(".p-panel-view").forEach((v) => v.classList.toggle("active", v.id === "panel-" + tab));
    $$(".p-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    render();
  }

  function openInCalc(modelId, hwId, gpus, bits) {
    const hw = getHw(hwId);
    const m = getModel(modelId);
    state.calc.hwId = hw.id;
    state.calc.gpus = gpus;
    state.calc.vram = hw.vram;
    state.calc.bw = hw.bw;
    state.calc.bits = bits;
    if (m.kind === "local") {
      state.calc.modelId = m.id;
      state.calc.totalB = m.totalB;
      state.calc.activeB = m.activeB;
      state.calc.layers = m.layers;
      state.calc.kvHeads = m.kvHeads;
      state.calc.headDim = m.headDim;
    }
    switchTab("calculator");
  }

  function renderPeriodic() {
    const hw = getHw(state.hwId);
    $("#pt-hw").value = state.hwId;
    state.gpus = renderGpuPills($("#pt-gpus"), hw, state.gpus, (n) => {
      state.gpus = n;
      state.activeCompoundId = null;
      syncCalc();
      render();
    });
    renderQuantPills($("#pt-quant"), state.quant, (q) => {
      state.quant = q;
      state.activeCompoundId = null;
      syncCalc();
      render();
    });

    const localModels = MODELS.filter((m) => m.kind === "local");
    let fitFast = 0, fitOk = 0, fitOff = 0;
    const evalMap = {};
    for (const m of MODELS) {
      const r = evalModel(m, hw, state.gpus, state.quant, 16384);
      evalMap[m.id] = r;
      if (m.kind === "local") {
        if (r.fitStatus === "fits" && r.batch1Tok >= 30) fitFast++;
        else if (r.fitStatus === "fits") fitOk++;
        else if (r.fitStatus === "offload") fitOff++;
      }
    }

    $("#rig-telemetry").textContent =
      (state.gpus > 1 ? state.gpus + "x " : "") + hw.short + " · " + (hw.vram * state.gpus) + " GB · " + (hw.bw * state.gpus) + " GB/s · " +
      (fitFast + fitOk) + "/" + localModels.length + " fit (" + fitOff + " offload)";

    const comp = COMPOUNDS.find((c) => c.id === state.activeCompoundId);
    const hlSet = new Set(comp ? comp.elements : []);

    let html = '<div class="pt-fam" style="border-bottom-color:var(--rule)"><b>Shell / VRAM</b><span>Custody axis</span></div>';
    for (const f of FAMILIES) {
      html += '<div class="pt-fam"><b>' + esc(f.lab) + "</b><span>" + esc(f.line) + " · " + f.region + "</span></div>";
    }

    for (const sh of SHELLS) {
      if (sh.n === 6) {
        html += '<div class="pt-custody"><i></i><span>CUSTODY BOUNDARY: ABOVE = WEIGHTS ON YOUR METAL · BELOW = LAB HOLDS THE WEIGHTS</span><i></i></div>';
      }
      html += '<div class="pt-shell"><strong>' + sh.n + ". " + esc(sh.name) + "</strong><em>" + esc(sh.cap) + "</em><span>" + esc(sh.ex) + "</span></div>";
      for (const f of FAMILIES) {
        const list = MODELS.filter((m) => m.family === f.id && m.shell === sh.n);
        if (!list.length) {
          html += '<div class="el-empty" aria-hidden="true"></div>';
          continue;
        }
        const m = list.find((x) => x.id === state.selectedModelId) || list[0];
        const extra = list.length - 1;
        const r = evalMap[m.id];
        let cls = "st-cloud", metric = "Hosted", topR = "API";
        if (m.kind === "local") {
          topR = m.totalB >= 1000 ? (m.totalB / 1000).toFixed(1) + "T" : m.totalB + "B";
          if (r.fitStatus === "fits") {
            cls = r.batch1Tok >= 30 ? "st-fast" : "st-fit";
            metric = r.batch1Tok.toFixed(0) + " t/s";
          } else if (r.fitStatus === "offload") {
            cls = "st-offload";
            metric = r.batch1Tok.toFixed(1) + " off";
          } else {
            cls = "st-exceed";
            metric = Math.round(r.weightGb) + " GB";
          }
        }
        const sel = m.id === state.selectedModelId ? " selected" : "";
        const hl = hlSet.has(m.id) ? " comp-hl" : "";
        html +=
          '<button type="button" class="el-cell ' + cls + sel + hl + '" data-el="' + m.id + '">' +
          '<div class="el-top"><span>' + m.atomic + "</span><span>" + topR + (extra > 0 ? " +" + extra : "") + "</span></div>" +
          '<div class="el-sym">' + esc(m.sym) + "</div>" +
          '<div class="el-name" title="' + esc(m.name) + '">' + esc(m.name) + "</div>" +
          '<div class="el-metric">' + metric + "</div>" +
          "</button>";
      }
    }

    const grid = $("#pt-grid");
    grid.innerHTML = html;
    grid.querySelectorAll("[data-el]").forEach((b) => {
      b.addEventListener("click", () => {
        state.selectedModelId = b.dataset.el;
        renderPeriodic();
      });
    });

    // Element Inspector
    const m = getModel(state.selectedModelId);
    const r = evalMap[m.id];
    const fam = FAMILIES.find((f) => f.id === m.family);
    const sh = SHELLS.find((s) => s.n === m.shell);
    const rigName = (state.gpus > 1 ? state.gpus + "x " : "") + hw.short;
    const sibs = MODELS.filter((x) => x.family === m.family && x.shell === m.shell);

    const sibHtml = sibs.length > 1
      ? '<div class="p-pill-row" style="margin-top:10px">' +
        sibs.map((s) => '<button type="button" class="p-pill' + (s.id === m.id ? " active" : "") + '" data-sib="' + s.id + '">' + esc(s.sym + ": " + s.name) + "</button>").join("") +
        "</div>"
      : "";

    let statsHtml = "", actHtml = "";
    if (m.kind === "local") {
      const fl = r.fitStatus === "fits" ? "FITS VRAM" : r.fitStatus === "offload" ? "CPU OFFLOAD" : "EXCEEDS VRAM";
      statsHtml =
        '<div class="insp-stats">' +
        '<div class="insp-stat"><b>' + r.batch1Tok.toFixed(1) + " tok/s</b><span>Batch=1 on " + esc(rigName) + "</span></div>" +
        '<div class="insp-stat"><b>' + r.weightGb.toFixed(1) + " GB</b><span>Weights (" + qLabel(state.quant) + ")</span></div>" +
        '<div class="insp-stat"><b>' + fl + "</b><span>Max " + r.maxStreams + " streams @ 16K</span></div>" +
        '<div class="insp-stat"><b>' + m.totalB + "B / " + m.activeB + "B</b><span>Total / Active (" + m.arch + ")</span></div>" +
        '<div class="insp-stat"><b>' + Math.round(m.maxCtx / 1024) + "K</b><span>Max context</span></div>" +
        '<div class="insp-stat"><b>' + esc(m.license) + "</b><span>Weights licence</span></div>" +
        "</div>";
      actHtml =
        '<div class="card-foot" style="padding-top:14px">' +
        '<button type="button" class="btn sm" id="insp-calc">Inspect in Roofline Calculator &rarr;</button>' +
        '<button type="button" class="btn ghost sm" id="insp-copy">Copy llama-bench Command</button>' +
        "</div>";
    } else {
      statsHtml =
        '<div class="insp-stats">' +
        '<div class="insp-stat"><b>Hosted Vault</b><span>Lab holds the weights</span></div>' +
        '<div class="insp-stat"><b>' + esc(m.license) + "</b><span>Licence</span></div>" +
        '<div class="insp-stat"><b>' + esc(m.released) + "</b><span>Release window</span></div>" +
        '<div class="insp-stat"><b>' + esc(fam ? fam.region : "") + "</b><span>Lab jurisdiction</span></div>" +
        "</div>";
      actHtml = '<p style="margin:12px 0 0;font-size:13px;color:var(--dim)">Below the Custody Boundary: prompts leave your hardware to the provider API.</p>';
    }

    $("#pt-inspector").innerHTML =
      "<div>" +
      '<div class="insp-head"><div class="insp-sym">' + esc(m.sym) + "</div><div>" +
      '<div class="card-num">Element #' + m.atomic + " · Shell " + sh.n + " (" + esc(sh.name) + ") · " + esc(fam.lab) + "</div>" +
      '<h3 style="margin:4px 0 2px;font:700 24px/1.1 var(--f-serif);color:var(--white)">' + esc(m.name) + "</h3>" +
      '<div style="font:400 12.5px var(--f-mono);color:var(--dim)">' + esc(m.released) + (m.hf ? " · " + esc(m.hf) : "") + "</div>" +
      "</div></div>" +
      sibHtml +
      '<p style="margin:12px 0 8px;color:var(--text);font-size:14.5px">' + esc(m.note) + "</p>" +
      '<div style="font-size:13px;color:var(--dim)"><strong>Isotopes:</strong> ' + esc((m.isotopes || []).join(" · ")) + "</div>" +
      actHtml +
      "</div><div>" + statsHtml + "</div>";

    $("#pt-inspector").querySelectorAll("[data-sib]").forEach((b) => {
      b.addEventListener("click", () => { state.selectedModelId = b.dataset.sib; renderPeriodic(); });
    });
    const cb = $("#insp-calc");
    if (cb) cb.addEventListener("click", () => openInCalc(m.id, state.hwId, state.gpus, state.quant));
    const cp = $("#insp-copy");
    if (cp) cp.addEventListener("click", () => copyCmd("llama-bench -m ./models/" + m.id + "-" + qLabel(state.quant) + ".gguf -ngl 99 -p 512,2048 -n 128,512", "llama-bench command"));

    // Compounds
    $("#compounds-grid").innerHTML = COMPOUNDS.map((c) => {
      const act = state.activeCompoundId === c.id ? " active" : "";
      return (
        '<button type="button" class="comp-card' + act + '" data-comp="' + c.id + '">' +
        '<div class="comp-top">' + c.formula.map((s) => '<span class="tag-chip gold">' + esc(s) + "</span>").join("") +
        '<span class="tag-chip" style="margin-left:auto">' + esc(c.tier) + "</span></div>" +
        '<h4>' + esc(c.name) + "</h4>" +
        '<div class="mono" style="font-size:12px;color:var(--gold)">' + esc(c.cost) + "</div>" +
        "<p>" + esc(c.desc) + "</p>" +
        "</button>"
      );
    }).join("");

    $("#compounds-grid").querySelectorAll("[data-comp]").forEach((b) => {
      b.addEventListener("click", () => {
        const c = COMPOUNDS.find((x) => x.id === b.dataset.comp);
        if (!c) return;
        state.activeCompoundId = c.id;
        state.hwId = c.hwId;
        state.gpus = c.gpus;
        state.quant = c.quant;
        state.selectedModelId = c.elements[0];
        syncCalc();
        render();
        toast("Loaded compound: " + c.name);
      });
    });

    renderCli();
  }

  function renderCli() {
    const hw = getHw(state.hwId);
    const local = MODELS.filter((m) => m.kind === "local");
    const best =
      local.find((m) => m.id === state.selectedModelId && evalModel(m, hw, state.gpus, state.quant).fitStatus === "fits") ||
      local.find((m) => evalModel(m, hw, state.gpus, state.quant).fitStatus === "fits") ||
      getModel("qwen35-4b");

    let cmd = "llama-bench -m ./models/" + best.id + "-" + qLabel(state.quant) + ".gguf -ngl 99 -p 512,2048 -n 128,512";
    if (state.cliEngine === "ollama") cmd = "ollama run " + best.id + " --verbose";
    if (state.cliEngine === "vllm") cmd = "vllm serve " + (best.hf || best.id) + " --tensor-parallel-size " + state.gpus + " --max-model-len 32768";
    if (state.cliEngine === "mlx") cmd = "python -m mlx_lm.benchmark --model mlx-community/" + best.name.replace(/\s+/g, "-") + "-4bit";
    $("#cli-cmd").textContent = cmd;
  }

  function renderCalculator() {
    const hw = getHw(state.calc.hwId);
    $("#c-hw").value = state.calc.hwId;
    state.calc.gpus = renderGpuPills($("#c-gpus"), hw, state.calc.gpus, (n) => { state.calc.gpus = n; renderCalculator(); });
    $("#c-vram").value = state.calc.vram;
    $("#c-bw").value = state.calc.bw;
    $("#c-overhead").value = state.calc.overhead;
    $("#c-model").value = state.calc.modelId;
    $("#c-totalb").value = state.calc.totalB;
    $("#c-activeb").value = state.calc.activeB;
    $("#c-bits").value = String(state.calc.bits);
    $("#c-ctx").value = String(state.calc.ctx);
    $("#c-kv").value = String(state.calc.kvBytes);
    $("#c-mintok").value = state.calc.minTok;
    $("#c-accept").value = state.calc.draftAccept;

    $("#c-spec").querySelectorAll("button").forEach((b) => b.classList.toggle("active", (b.dataset.s === "1") === state.calc.speculative));

    const r = computeRoofline({
      vramPerGpu: state.calc.vram, bwPerGpu: state.calc.bw, gpus: state.calc.gpus,
      overheadGb: state.calc.overhead, totalB: state.calc.totalB, activeB: state.calc.activeB,
      weightBits: state.calc.bits, layers: state.calc.layers, kvHeads: state.calc.kvHeads, headDim: state.calc.headDim,
      ctxTokens: state.calc.ctx, kvBytes: state.calc.kvBytes, minTokPerSec: state.calc.minTok,
      speculative: state.calc.speculative, draftAccept: state.calc.draftAccept, cpuOnly: !!hw.cpuOnly
    });

    let pillCls = "ok", pillText = "FITS IN VRAM: Batch " + r.maxStreams + " clears memory (" + r.totalVram + " GB) and speed (" + state.calc.minTok + " tok/s) floor";
    if (r.fitStatus === "offload") {
      pillCls = "warn";
      pillText = "PARTIAL CPU OFFLOAD: Spills " + Math.round(r.offloadRatio * 100) + "% into system RAM";
    } else if (r.fitStatus === "exceeds") {
      pillCls = "bad";
      pillText = "EXCEEDS VRAM: Needs " + r.baseNeededGb.toFixed(1) + " GB vs " + r.usableVram.toFixed(1) + " GB usable";
    }

    const tot = Math.max(r.totalVram, r.weightGb + r.kvPerStreamGb + r.overheadGb + r.draftGb);
    const wPct = Math.min(100, (r.weightGb / tot) * 100);
    const kPct = Math.min(100 - wPct, (r.kvPerStreamGb / tot) * 100);
    const oPct = Math.min(100 - wPct - kPct, ((r.overheadGb + r.draftGb) / tot) * 100);

    $("#c-output").innerHTML =
      '<div class="card-num" style="margin-bottom:10px">Roofline Telemetry Ceiling</div>' +
      '<div class="c-status ' + pillCls + '">' + esc(pillText) + "</div>" +
      '<div class="c-big">' + r.batch1Tok.toFixed(1) + " <small>tok/s (Batch=1)</small></div>" +
      '<div class="c-grid">' +
      '<div class="insp-stat"><b>' + r.maxStreams + 'x</b><span>Max streams</span></div>' +
      '<div class="insp-stat"><b>' + r.aggBatchedTok.toFixed(0) + ' tok/s</b><span>Peak batched</span></div>' +
      '<div class="insp-stat"><b>' + r.perStreamTok.toFixed(1) + ' tok/s</b><span>Per-stream</span></div>' +
      '<div class="insp-stat"><b>' + r.effBw.toFixed(0) + ' GB/s</b><span>Eff. BW (' + Math.round(r.effFactor * 100) + '%)</span></div>' +
      "</div>" +
      '<div class="mono" style="font-size:12px;color:var(--gold);margin-top:14px">VRAM Budget (' + r.totalVram + " GB pool)</div>" +
      '<div class="vbar"><i class="vb-w" style="width:' + wPct.toFixed(1) + '%"></i><i class="vb-k" style="width:' + kPct.toFixed(1) + '%"></i><i class="vb-o" style="width:' + oPct.toFixed(1) + '%"></i></div>' +
      '<div class="vleg">' +
      '<span><b style="color:var(--gold)">&#9632;</b> Weights: ' + r.weightGb.toFixed(1) + " GB</span>" +
      '<span><b style="color:var(--crimson2)">&#9632;</b> 1x KV (' + Math.round(state.calc.ctx / 1024) + "K): " + r.kvPerStreamGb.toFixed(2) + " GB</span>" +
      '<span><b style="color:#4ade80">&#9632;</b> Overhead: ' + (r.overheadGb + r.draftGb).toFixed(1) + " GB</span>" +
      '<span><b style="color:var(--dim)">&#9632;</b> Free: ' + r.freeGb.toFixed(1) + " GB</span>" +
      "</div>" +
      '<div class="formula-note">Eff_BW = (' + state.calc.bw + " GB/s x " + state.calc.gpus + ") x " + r.effFactor.toFixed(2) + " = " + r.effBw.toFixed(0) + " GB/s<br>" +
      "Active_Step = " + state.calc.activeB + "B x (" + state.calc.bits + "/8) x 1.05 + 0.35 x KV_GB</div>";
  }

  function renderHardware() {
    const q = state.hwSearch.trim().toLowerCase();
    const list = HARDWARE.filter((h) => !q || (h.name + " " + h.group + " " + h.engine).toLowerCase().includes(q));
    const local = MODELS.filter((m) => m.kind === "local");

    $("#hw-grid").innerHTML = list.map((h) => {
      const g = state.hwMulti[h.id] || 1;
      const allowed = [1, 2, 4, 8].filter((n) => n <= (h.maxMulti || 1));
      const tv = h.vram * g, tbw = h.bw * g, cpg = Math.round((h.price * g) / tv);
      const fits = local.map((m) => ({ m, r: evalModel(m, h, g, 4.5) })).filter((x) => x.r.fitStatus === "fits").sort((a, b) => b.m.totalB - a.m.totalB);
      const top = fits[0];
      return (
        '<article class="card" style="gap:12px">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
        '<div><span class="card-num">' + esc(h.group) + "</span><h3 style=\"margin-top:4px;font-size:20px\">" + esc(h.name) + "</h3></div>" +
        '<span class="tag-chip gold">' + fits.length + " fit</span></div>" +
        '<div class="p-pill-row">' + allowed.map((n) => '<button type="button" class="p-pill' + (n === g ? " active" : "") + '" data-hm="' + h.id + '" data-n="' + n + '">' + n + "x</button>").join("") + "</div>" +
        '<div class="hw-specs"><div><b>' + tv + " GB</b><span>VRAM</span></div><div><b>" + tbw.toLocaleString() + "</b><span>GB/s</span></div><div><b>$" + cpg + "</b><span>/ GB</span></div></div>" +
        '<p style="font-size:13.5px">' + (top ? "Top Q4 fit: <strong style=\"color:var(--white)\">" + esc(top.m.name) + "</strong> (" + top.r.batch1Tok + " tok/s)" : "Pocket offload only") + "</p>" +
        '<div class="card-foot"><button type="button" class="btn ghost sm" data-hi="' + h.id + '" data-n="' + g + '">Relight Periodic Table &rarr;</button></div>' +
        "</article>"
      );
    }).join("");

    $("#hw-grid").querySelectorAll("[data-hm]").forEach((b) => {
      b.addEventListener("click", () => { state.hwMulti[b.dataset.hm] = Number(b.dataset.n); renderHardware(); });
    });
    $("#hw-grid").querySelectorAll("[data-hi]").forEach((b) => {
      b.addEventListener("click", () => {
        state.hwId = b.dataset.hi;
        state.gpus = Number(b.dataset.n);
        state.activeCompoundId = null;
        syncCalc();
        switchTab("periodic");
      });
    });
  }

  function render() {
    if (state.tab === "periodic") renderPeriodic();
    if (state.tab === "calculator") renderCalculator();
    if (state.tab === "hardware") renderHardware();
  }

  function init() {
    populateHw($("#pt-hw"));
    populateHw($("#c-hw"));
    $("#c-model").innerHTML = MODELS.filter((m) => m.kind === "local").map((m) =>
      '<option value="' + m.id + '">' + esc(m.name) + " (" + m.totalB + "B " + m.arch + (m.arch === "MoE" ? ", " + m.activeB + "B act" : "") + ")</option>"
    ).join("");

    $$(".p-tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
    $("#pt-hw").addEventListener("change", (e) => { state.hwId = e.target.value; state.activeCompoundId = null; syncCalc(); render(); });
    $("#clear-comp").addEventListener("click", () => { state.activeCompoundId = null; renderPeriodic(); });

    $("#cli-engines").querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        state.cliEngine = b.dataset.ce;
        $("#cli-engines").querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
        renderCli();
      });
    });
    $("#cli-copy").addEventListener("click", () => copyCmd($("#cli-cmd").textContent, state.cliEngine + " command"));

    $("#c-hw").addEventListener("change", (e) => {
      const hw = getHw(e.target.value);
      state.calc.hwId = hw.id; state.calc.vram = hw.vram; state.calc.bw = hw.bw;
      renderCalculator();
    });
    $("#c-model").addEventListener("change", (e) => {
      const m = getModel(e.target.value);
      state.calc.modelId = m.id; state.calc.totalB = m.totalB; state.calc.activeB = m.activeB;
      state.calc.layers = m.layers; state.calc.kvHeads = m.kvHeads; state.calc.headDim = m.headDim;
      renderCalculator();
    });
    const bindNum = (s, k) => $(s).addEventListener("input", (e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v) && v > 0) { state.calc[k] = v; renderCalculator(); } });
    bindNum("#c-vram", "vram"); bindNum("#c-bw", "bw"); bindNum("#c-overhead", "overhead");
    bindNum("#c-totalb", "totalB"); bindNum("#c-activeb", "activeB"); bindNum("#c-mintok", "minTok"); bindNum("#c-accept", "draftAccept");
    $("#c-bits").addEventListener("change", (e) => { state.calc.bits = parseFloat(e.target.value); renderCalculator(); });
    $("#c-ctx").addEventListener("change", (e) => { state.calc.ctx = parseInt(e.target.value, 10); renderCalculator(); });
    $("#c-kv").addEventListener("change", (e) => { state.calc.kvBytes = parseFloat(e.target.value); renderCalculator(); });
    $("#c-spec").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { state.calc.speculative = b.dataset.s === "1"; renderCalculator(); }));
    $("#hw-search").addEventListener("input", (e) => { state.hwSearch = e.target.value; renderHardware(); });

    render();
  }

  init();
})();
