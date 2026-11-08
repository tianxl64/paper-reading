# PaperReading · 论文与代码精读库

[在线阅读](https://tianxl64.github.io/paper-reading/) · 最近整理：2026-11-08

共 50 个完整阅读入口，涵盖自动驾驶、世界模型、VLA、机器人策略、多模态与强化学习。每个入口保留选定交付中的完整正文、公式、图解、代码与问答。

网页可直接离线阅读：下载或克隆完整仓库后打开 index.html；共享 assets 文件夹须一起保留。图片采用逐像素一致的无损编码，公式以静态结果和本地字体交付。联网论文链接与本地研究审计附件按实际可用范围说明。

部分论文同时有系列精读、专题图解和完整问答，分别保留为阅读入口。历史专题读本沿用当时的研究范围；本次网站验收不代表重新运行实验。GIGA 当前研究修订尚未完成，站点继续保留上一版已验收的正式读本。

| 读本 | 方向 | 内容 |
|---|---|---|
| [RL-Token：机器人策略、强化学习与源码联合精读](https://tianxl64.github.io/paper-reading/reports/rl-token/index.html) | VLA / 具身智能 | 机器人策略中的 RL token、强化学习闭环、π0 接口与固定源码；附相关论文读本和源码浏览页。 |
| [Dreamer 系列论文—代码联合精读](https://tianxl64.github.io/paper-reading/reports/dreamer-series/index.html) | World Models / 强化学习 | PlaNet、DreamerV1/V2/V3 的 RSSM、想象 rollout、价值学习、训练稳定性与代码对应。 |
| [DreamerV1：学术型完整离线精读](https://tianxl64.github.io/paper-reading/reports/dreamer-v1/index.html) | World Models / 强化学习 | 从论文动机到 RSSM、潜在想象、actor-critic 和官方实现，逐层解释 DreamerV1。 |
| [WAM 系列论文与代码联合精读](https://tianxl64.github.io/paper-reading/reports/wam/index.html) | World / Action Models | 世界与动作模型的系列比较，覆盖因果闭环、latent planning、价值接口、数据与评估边界。 |
| [V-JEPA 2 与 JEPA 系列论文—代码精读](https://tianxl64.github.io/paper-reading/reports/vjepa2-jepa/index.html) | 视觉表征 / World Models | JEPA 系列表征预测、V-JEPA 2 的视频建模、训练目标、规划接口和实现证据。 |
| [Qwen-Drive-1.0：论文—代码闭环精读](https://tianxl64.github.io/paper-reading/reports/qwen-drive-1.0/index.html) | 自动驾驶 / VLM | 视觉语言共享表征、BEV 感知、Planning Expert、训练流程与跨论文源码核验。 |
| [WoTE：在线轨迹评价与 BEV 世界模型](https://tianxl64.github.io/paper-reading/reports/wote/index.html) | 自动驾驶 / World Models | BEV 世界模型预测未来，用在线轨迹评价选择驾驶动作；连接损失、奖励和真实代码。 |
| [AD-R1：闭环强化学习与世界模型](https://tianxl64.github.io/paper-reading/reports/ad-r1/index.html) | 自动驾驶 / World Models | 驾驶闭环强化学习、世界模型与训练信号的机制拆解及实验边界。 |
| [DreamDojo：通用机器人世界模型](https://tianxl64.github.io/paper-reading/reports/dreamdojo/index.html) | World / Action Models | 通用机器人世界模型的动作条件化、视频预测、数据与训练目标。 |
| [Dreamer 系列演进深度分析与问答](https://tianxl64.github.io/paper-reading/reports/dreamer-evolution/index.html) | World Models / 强化学习 | 比较 Dreamer 各代设计选择，并保留长篇追问、实现细节和演进原因。 |
| [DreamZero 与 Wan2.2：视频世界模型深入问答](https://tianxl64.github.io/paper-reading/reports/dreamzero/index.html) | World / Action Models | DreamZero 与 Wan2.2 的历史条件、自回归上下文、动作视频建模和训练推理问答。 |
| [Drive-JEPA：视觉预测与轨迹蒸馏](https://tianxl64.github.io/paper-reading/reports/drive-jepa/index.html) | 自动驾驶 / World Models | 用联合嵌入预测学习驾驶表征，分析视觉预测、轨迹蒸馏与代码训练路径。 |
| [DriveDreamer：驾驶世界模型深度精读](https://tianxl64.github.io/paper-reading/reports/drivedreamer/index.html) | World Models / 自动驾驶 | 驾驶场景的结构化条件、视频生成、世界模型训练和实验解释。 |
| [DriveLaW：论文精读与源码实现](https://tianxl64.github.io/paper-reading/reports/drivelaw/index.html) | World Models / 自动驾驶 | Noise Reinjection、视频与规划交错计算、渐进训练、梯度边界与开源实现。 |
| [DriveVLA-W0：学术型论文—代码精读](https://tianxl64.github.io/paper-reading/reports/drivevla-w0-academic/index.html) | 自动驾驶 / VLA | 按论文结构深入阅读 DriveVLA-W0，连接模型机制、训练监督、实验与代码。 |
| [DriveZero 深度精读](https://tianxl64.github.io/paper-reading/reports/drivezero/index.html) | World Models / 自动驾驶 | 驾驶世界模型的任务设定、生成机制、方法假设及实验支持范围。 |
| [FutureX：潜在思维链世界模型](https://tianxl64.github.io/paper-reading/reports/futurex/index.html) | World Models / 自动驾驶 | 潜在思维链如何连接未来预测与驾驶规划，并核对关键公式和实现接口。 |
| [LAW：Latent World Model](https://tianxl64.github.io/paper-reading/reports/law/index.html) | World Models / 自动驾驶 | 潜在世界模型的状态演化、条件信息、训练损失及驾驶使用方式。 |
| [MLP-Mixer 与 MindVLA-U1 深度分析](https://tianxl64.github.io/paper-reading/reports/mlp-mixer-mindvla/index.html) | VLA / 具身智能 | 从 token/channel mixing 理解 MLP-Mixer，并延伸到 MindVLA 的动作建模。 |
| [Motus：统一潜在动作世界模型](https://tianxl64.github.io/paper-reading/reports/motus/index.html) | World / Action Models | 视频、动作与理解三种 token 的联合注意力、维度、适配层和训练契约。 |
| [LatentDriver 学术深度精读](https://tianxl64.github.io/paper-reading/reports/latentdriver/index.html) | World Models / 自动驾驶 | 潜在驾驶表征与决策机制的学术精读，附原图、公式与方法边界。 |
| [TOAD 与 World Engine：论文深度分析](https://tianxl64.github.io/paper-reading/reports/toad-world-engine/index.html) | World Models / 自动驾驶 | TOAD 与 World Engine 的任务、模型流程、数据规模和世界模型设计比较。 |
| [π0 与 π0-FAST 机制详解](https://tianxl64.github.io/paper-reading/reports/pi0-fast/index.html) | VLA / 具身智能 | 解释 π0 的连续动作建模与 π0-FAST 动作 token 化，两条训练推理路线相互对照。 |
| [π0：论文机制图解](https://tianxl64.github.io/paper-reading/reports/pi0-figures/index.html) | VLA / 具身智能 | 围绕 π0 论文方法组织机制图解，连接视觉语言输入、动作专家与 flow matching。 |
| [π0 完整网络结构：论文与官方代码](https://tianxl64.github.io/paper-reading/reports/pi0-architecture/index.html) | VLA / 具身智能 | π0 完整网络、状态 token、动作时间嵌入、注意力边界和官方训练推理代码。 |
| [Qwen-VL 系列模块实现与设计细节](https://tianxl64.github.io/paper-reading/reports/qwen-vl-modules/index.html) | VLM / 多模态 | Qwen2-VL、2.5-VL、3-VL 的视觉编码、位置编码、时序处理、DeepStack 与源码。 |
| [Diffusion-RL：FlowGRPO 与 DiffusionDriveV2](https://tianxl64.github.io/paper-reading/reports/diffusion-rl-study/index.html) | 自动驾驶 / 轨迹生成 | FlowGRPO、DiffusionDriveV2 与 diffusion/flow 策略强化学习的公式和实现比较。 |
| [GIGAFLOW：自博弈与自主驾驶机制](https://tianxl64.github.io/paper-reading/reports/gigaflow/index.html) | World Models / 强化学习 | 自博弈、环境随机化与规模如何形成自主驾驶能力，按机制主线展开图解。 |
| [UniDrive-WM 学术深度精读](https://tianxl64.github.io/paper-reading/reports/unidrive-wm/index.html) | World Models / 自动驾驶 | 统一驾驶世界模型的条件、潜在表示、预测规划与实验细节。 |
| [自动驾驶与具身 VLA 中的 Diffusion + RL](https://tianxl64.github.io/paper-reading/reports/vla-diffusion-rl/index.html) | 自动驾驶 / VLA | 比较驾驶和具身 VLA 中 diffusion policy、flow matching、GRPO 与奖励学习。 |
| [World4Drive：意图感知潜在世界模型](https://tianxl64.github.io/paper-reading/reports/world4drive/index.html) | World Models / 自动驾驶 | 意图感知潜在世界模型的输入输出、条件建模、损失和驾驶规划链路。 |
| [Veo World Simulator：论文机制图解](https://tianxl64.github.io/paper-reading/reports/veo-world/index.html) | World / Action Models | Veo 作为机器人世界模拟器：动作条件化、视频交互、评估及能力边界。 |
| [Diffusion Planner：完整机制图解](https://tianxl64.github.io/paper-reading/reports/diffusion-planner/index.html) | 自动驾驶 / 轨迹生成 | 以完整机制图解释扩散规划、条件引导、去噪步骤、训练与推理。 |
| [Alpamayo-R1：推理与连续驾驶动作](https://tianxl64.github.io/paper-reading/reports/alpamayo-r1/index.html) | 自动驾驶 / VLA | 从因果推理到连续驾驶动作，解释输入、推理链、策略机制和实验。 |
| [DYNA-1 / DYNA-2 / Epona 深度精读](https://tianxl64.github.io/paper-reading/reports/dyna-series/index.html) | World Models / 自动驾驶 | DYNA-1、DYNA-2 与 Epona 的世界模型设计、方法演进和跨论文证据。 |
| [MindVLA-U1 学术精读](https://tianxl64.github.io/paper-reading/reports/mindvla-u1/index.html) | VLA / 具身智能 | MindVLA-U1 的多模态信息、动作生成、模块机制与训练评估。 |
| [π0 Action Expert 与 Conditional Flow Matching](https://tianxl64.github.io/paper-reading/reports/pi0-action-expert/index.html) | VLA / 具身智能 | 逐层拆解 π0 Action Expert、Conditional Flow Matching、噪声时间与推理缓存。 |
| [自动驾驶 VLA 架构、版本演化与技术学习手册](https://tianxl64.github.io/paper-reading/reports/vla-landscape/index.html) | 自动驾驶 / VLA | 自动驾驶 VLA 的架构矩阵、版本演进、关键接口和系统学习路线。 |
| [自动驾驶 VLM：分层 CoT 与强化学习](https://tianxl64.github.io/paper-reading/reports/vlm-cot-rl/index.html) | 自动驾驶 / VLM | VLM 如何在驾驶 VLA 中组织分层 CoT、强化学习信号与决策接口。 |
| [DiffusionDriveV2：完整深入问答](https://tianxl64.github.io/paper-reading/reports/diffusiondrivev2-qa/index.html) | 自动驾驶 / 轨迹生成 | 完整保留 DiffusionDriveV2 的深入问答，便于按实现疑问和机制细节查阅。 |
| [Scaling Self-Play for End-to-End Driving：深度解析](https://tianxl64.github.io/paper-reading/reports/scaling-self-play/index.html) | 深度学习 / 专题解析 | Scaling Self-Play for End-to-End Driving 的方法、规模效应、训练与实验深度解析。 |
| [Veo World Simulator：增强学习版解析](https://tianxl64.github.io/paper-reading/reports/veo-world-learning/index.html) | 深度学习 / 专题解析 | Veo Robotics 的教学增强读本，包含机制解释、例子、图表和细致研究问答。 |
| [Robust Autonomy：完整深度学习版解析](https://tianxl64.github.io/paper-reading/reports/gigaflow-learning/index.html) | 深度学习 / 专题解析 | Robust Autonomy Emerges from Self-Play 的完整学习版，连接原论文图与方法解释。 |
| [π0：通用机器人策略模型](https://tianxl64.github.io/paper-reading/reports/pi0/index.html) | VLA / 具身智能 | 从 VLM 到连续动作的机器人策略：数据混合、动作专家、训练阶段与代码边界。 |
| [DiffusionDriveV2：扩散规划与强化学习](https://tianxl64.github.io/paper-reading/reports/diffusiondrivev2/index.html) | 自动驾驶 / 轨迹生成 | Anchor-based truncated diffusion、PDM reward、GRPO 与论文—代码实现边界。 |
| [DriveVLA-W0：视觉语言动作驾驶模型](https://tianxl64.github.io/paper-reading/reports/drivevla-w0/index.html) | 自动驾驶 / VLA | 双世界模型、联合注意力、动作 tokenizer、flow matching 与失败诊断。 |
| [OneVL：双层视觉语言推理与规划](https://tianxl64.github.io/paper-reading/reports/onevl-dual-layer/index.html) | VLM / 自动驾驶 | 双层 latent 表征、损失分解、训练拓扑、代码映射与边界审计。 |
| [Xiaomi OneVL：cleanrun 深度解析](https://tianxl64.github.io/paper-reading/reports/xiaomi-onevl-cleanrun/index.html) | VLM / 自动驾驶 | OneVL 机制、训练—推理接口和实现边界的精简可读版本。 |
| [面向 policy 的大模型：Jev 与 Code as Policies](https://tianxl64.github.io/paper-reading/reports/policy-jev-code-as-policies/index.html) | Agentic AI / Policy | 结构化概率决策器与可执行策略程序的接口思路比较。 |
| [GIGA+DriveDreamer：闭环世界模型精读](https://tianxl64.github.io/paper-reading/reports/giga-drivedreamer/index.html) | World Models / 自动驾驶 | GIGA 与 DriveDreamer 的方法、跨论文比较、PaperQA2 证据和正式图解。 |
