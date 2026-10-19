---
title: FINet改进思路
date: 2026-03-27
category: 论文笔记
tags:
  - 轨迹预测
  - 深度学习
description: 探讨结合观测自适应训练、历史补全与拓扑排序改进 FINet 的待验证方案。
---

本文围绕未来感知交互网络（Future-Aware Interaction Network，FINet）提出一组**待验证的改进思路**。FINet 原论文发表于 ICCV 2025；本文以其未来感知交互与 Mamba 建模方式为基础，讨论短历史、遮挡和复杂道路拓扑下可能需要补充的机制。[FINet 原论文][11]

下文区分原论文已有设计、本文对潜在问题的推测，以及拟开展的实验。本文仅给出候选框架的设计，预期收益均为研究假设；文中的训练阶段表和评测配置属于设计提纲，不包含实验结果。

## 1) FINet 在复杂城市道路中的潜在短板

### A. 短历史可能影响历史表征、未来 token 初始化与参考点预测

FINet 的轻量场景编码器（Lightweight Scene Encoder，LSEnc）用 Mamba 编码智能体历史，并取当前时刻的末端 token 表示整段轨迹。未来 token 由目标智能体的历史表征、可学习意图和归纳偏置初始化，再进入未来感知交互 Mamba（Future-Aware Interaction Mamba，FIM）。[FINet，§4.1–§4.2][11]

据此推测：极短历史提供的速度、朝向和意图信息可能不足，并进一步影响未来 token 和排序参考点。这里的“级联误差”需要通过分层表征与失败案例分析验证，不能仅由结构推导为既定缺陷。论文方法部分未专门展开跟踪年龄和补全不确定性的传递机制；数据有效性掩码等实现细节仍需对照代码确认。

### B. 缺失历史与完全未观测交互体是两个问题

时间自适应渐进蒸馏（Temporal-adaptive Progressive Distillation，TaPD）将短历史的信息不足作为研究对象，并结合跨长度蒸馏与显式历史补全。[TaPD 原论文][12] 这为 FINet 提供了可借鉴的训练路线，但不能据此认定历史补全可以恢复所有真实运动状态。

已跟踪智能体的缺失过去可以作为轨迹补全任务；完全未被观测的交互体则涉及存在性和占用推断。Scene Informer 联合研究可见智能体预测与遮挡区域的占用、轨迹推断，为后者提供了方法参照。[Scene Informer][1] 两类任务的数据与监督条件应分别说明。

### C. 每次重排使用一个参考点，可能不足以表达多分支拓扑

FINet 使用自适应重排策略（Adaptive Reorder Strategy，ARS），依据到参考点（Reference Point，RP）的距离排列场景 token。原 FIM 有两轮重排：第一轮参考点来自目标历史表征，第二轮来自更新后的第一个未来 token，并使用终点对齐监督。[FINet，§4.2][11] 因此，本文讨论的是“每轮单参考点”的局限，而非整个模型只有一个参考点。

多出口路口中，欧氏邻近未必等同于路由可达或潜在冲突相关。拓扑感知综述讨论了车道拓扑和结构化道路语义，但没有验证本文提出的拓扑排序方法。[拓扑感知综述][2] 用多分支锚点替换或补充距离排序是否有益，仍需消融。

### D. 单一线性化方式可能产生顺序偏置

FINet 使用双向 Mamba（Bidirectional Mamba，Bi-Mamba）处理场景序列。沿路由、沿冲突关系和沿几何邻近排列 token，可能强调不同交互；双向扫描能否充分缓解这种差异有待测试。首版先比较一种拓扑顺序与原 ARS，多顺序并行扫描留作扩展。

### E. 长尾模式覆盖与概率校准需要单独检查

FINet 使用赢家通吃（Winner-Take-All，WTA）监督，并结合轨迹回归、模式评分、中间监督和参考点对齐。[FINet，§4.4][11] 稀有模式是否获得足够训练、模式分数是否校准，不能从损失名称直接判断。软分配和分支约束是候选改法，其多样性、准确率与校准效果都需验证。

## 2) TaPD 中适合迁移的思想及其边界

### A. 共享主干，按真实观测条件调整归一化

TaPD 的观测自适应预测器（Observation-Adaptive Forecaster，OAF）共享跨长度主干参数，并保留长度专属的层归一化（Layer Normalization，LayerNorm）参数。[TaPD，§III-B][12] 本文将观测自适应（Observation-Adaptive，OA）作为总体训练原则，将 FINet 的预测主干改造成 OAF；OAF 是预测部分的角色名称。

迁移到 FINet 时，拟在 LSEnc 与 FIM 中先加入长度条件化的归一化参数，再按消融结果决定是否扩展到解码器。均方根归一化（Root Mean Square Normalization，RMSNorm）或 LayerNorm 的选择应遵循对应层的原实现，不能把替换所有归一化层视为已验证配置。条件同时保留真实观测步数、时间跨度和缺失掩码，补齐后的张量长度不替代真实观测长度。

### B. 从全体智能体特征蒸馏，逐步扩展到多层

TaPD 的渐进知识蒸馏（Progressive Knowledge Distillation，PKD）在相邻观测长度间对齐全体智能体特征，教师分支停止梯度，而非只对齐关注智能体（Agent of Interest，AOI）的最终特征。[TaPD，§III-B][12]

本文拟先蒸馏 LSEnc 的智能体 token 与 FIM 的未来 token；时间增强解码器（Temporal Enhanced Decoder，TEDec）的轨迹潜变量作为后续扩展。FINet 原 TEDec 将未来 token 展开为时间序列，再聚合场景信息并进行时间细化。[FINet，§4.3][11] 多层蒸馏的新增位置与对齐方式属于本文设想，具体匹配见 §3.4。

### C. 将历史补全扩为带掩码和不确定性的前端

TaPD 的时间回填模块（Temporal Backfilling Module，TBM）显式重建缺失的历史前缀。[TaPD，§III-C][12] 本文拟将其扩为观测自适应补全前端（Observation-Adaptive Completion Front-End，OACF）：保留历史补全功能，新增真实观测掩码和补全不确定性；遮挡占用分支则依赖额外监督条件。

OA 是总体原则，OAF 是预测主干，OACF 是位于主干之前的补全模块，三者不互为别名。间歇丢帧、置信度输出和隐藏占用也不应全部归为 TaPD 已有功能。

### D. 保留解耦训练，核算新增成本

TaPD 采用“先训练 OAF、独立训练 TBM、冻结 TBM 后微调 OAF”的三阶段协议，最后阶段关闭 PKD。[TaPD，§III-D][12] 本文保留这一核心顺序，另列可选预训练与校准阶段。补全、锚点搜索和多次扫描均可能增加成本，需测量完整流水线，不能直接继承 FINet 原模型的效率结论。

## 3) 候选框架：Urban-OA-FINet

### 3.1 首版最小组件与扩展边界

首版暂称 **Urban-OA-FINet-Core**，保留 FINet 的未来感知交互、Mamba 场景建模和 TEDec，仅组合以下组件：

1. 真实观测掩码、观测步数和跟踪年龄输入，以及长度条件化归一化。
2. 轻量 TBM：先为 AOI 与关键邻居补全位置，并输出位置分布尺度；关键邻居依据当前可见轨迹与候选路由的冲突关系选择，数量上限作为待定超参数。
3. LSEnc 与 FIM 两处 PKD，以及每个场景仅使用一种拓扑排序的 ARS 改造。

首版保留原 WTA 目标作为受控起点；分支感知软分配随后单独加入。隐藏占用、多顺序扫描、掩码预训练和校准分别消融，不作为首版有效性的先决条件。残差扩散、连续记忆与测试时更新留作后续扩展。这样仍沿用“补全观测—调整排序—改进多模态训练”的思路，同时降低归因难度。

### 3.2 OACF 与长度条件化 LSEnc：接口及置信度传播

首版输入包括二维位置历史 $X_{\mathrm{obs}}\in\mathbb{R}^{N\times H\times 2}$、地图车道图 $G$、真实观测掩码 $M$、观测步数与跟踪年龄；类别等属性另行编码，可见性线索仅在数据支持时加入。跟踪年龄指当前时刻距首次跟踪的时长，单位为秒，不等于有效观测步数。

TBM 输出缺失位置的均值 $\mu^x$ 和对角协方差 $\Sigma^x$，并按下式组装历史：

$$
\widehat X=M\odot X_{\mathrm{obs}}+(1-M)\odot\mu^x.
$$

原始观测保持不变，$M$ 也保持不变。补全后的历史、$M$、$\log\operatorname{diag}\Sigma^x$ 及原始观测条件一起进入长度条件化轻量场景编码器（Length-Conditioned Lightweight Scene Encoder，LC-LSEnc）。首版可用 $c=\exp[-\operatorname{tr}(\Sigma^x)/s_x^2]$ 将补全尺度映射为门控值，其中 $s_x$ 是在训练集确定的米制尺度；$c$ 只是可靠性特征，尚不是经过校准的正确概率。真实观测位置使用单独的掩码标记；若上游感知也有不确定性，应另行输入。

置信度经特征投影进入 FIM，并作为 TEDec 的条件特征，避免只在输入端附加后丢失。拟在未来 token 初始化中加入拓扑与置信度条件：

$$
T_{\mathrm{fut}}^k=h_0+e_{\mathrm{intent}}^k+e_{\mathrm{topo}}^{b(k)}
+g(U_{\mathrm{past}})\odot e_{\mathrm{bias}}^k+e_{\mathrm{occ}}^k.
$$

其中 $b(k)$ 为模式对应的分支，$U_{\mathrm{past}}$ 汇总补全尺度；无占用分支时令 $e_{\mathrm{occ}}^k=0$。这属于候选初始化，需与原 FINet 的偏置注入方式对照。

**隐藏占用信号的来源。** OACF 的可选占用潜变量 $H_{\mathrm{occ}}$ 由不可见区域中的车道片段或冲突区查询生成，不把 TBM 补出的轨迹直接当作隐藏智能体真值。监督分三种条件处理：

* 若训练数据在同一时刻有可用的完整标注，可用被遮挡智能体的位置生成区域占用标签；可见性来自传感器视场或遮挡几何计算，需说明近似误差。
* 若只有轨迹标注，先从完整训练场景中人为移除某个智能体的全部输入历史，以原标注生成占用正例。这只能检验合成不可见场景；负例限于可确认无占用的有效区域，未标注区域不能直接标为无占用。
* 若有激光雷达序列，可另行研究占用栅格的自监督预测；相关工作依赖传感器占用表示，不能直接等同于仅用矢量轨迹的方案。[自监督多未来占用预测][6]

没有可靠标签或传感器信号时，关闭占用损失并暂不训练该分支。地图几何只能提供风险区域先验，不能被称为隐藏占用真值。训练标签可以来自离线标注，但推理输入只使用当前及过去可获得的信息。

### 3.3 拓扑感知 FIM：锚点生成、匹配与排序

拓扑感知未来交互 Mamba（Topology-Aware Future Interaction Mamba，TA-FIM）拟用车道分支锚点补充原参考点：

1. **生成候选。** 将 AOI 当前观测位置投影到邻近车道，按车道连接关系在有限距离内搜索可达分支。朝向不可靠时保留多个起始车道；合并重复路由，并保留停车及自由运动候选。搜索距离、候选数上限和筛选规则在训练阶段确定，不使用真实未来筛选分支。
2. **生成锚点。** 每个保留分支以车道标识序列作为稳定编号。根据当前运动状态与预测时域，在分支中心线上选基准弧长，预测有界的沿线残差得到锚点 $a_j$。候选数受模式预算 $K$ 限制，同一分支可以分配多个模式槽位。地图缺失或目标不受车道约束时使用自由运动候选。
3. **匹配监督。** 训练时依据真实未来终点到候选路由的距离、末段朝向与路径偏离程度匹配分支 $j^*$。匹配只用于损失；候选选择与推理不访问真实未来。歧义样本使用软标签或屏蔽分支监督；候选未覆盖真实路由时记录覆盖失败，不能事后补入真实路由掩盖问题。
4. **排序。** 对候选分支 $j$ 与场景元素 $i$，先尝试一个可解释的成本：

$$
r_i^{(j)}=\alpha\frac{d_{\mathrm{euc}}(i,a_j)}{s_e}
+\beta\frac{\min(d_G(i,j),d_{\max})}{s_g}-\gamma c_i^{(j)}.
$$

$d_G$ 为车道图距离，不可达时截断到 $d_{\max}$；$c_i^{(j)}\in[0,1]$ 表示元素关联车道与该路由的几何冲突相关度。距离尺度 $s_e,s_g$ 及非负权重由训练集或验证集确定。成本越小代表越相关，按成本降序排列，使相关元素靠近序列末端，再按原结构追加 AOI 和未来 token。排序后保留逆置换，便于恢复 token 身份。

首版用当前观测预测的分支概率选择一个候选进行场景排序，所有候选分支仍可用于未来 token；多分支并行扫描及门控融合后续再测。离散选分支和排序不反向传播，锚点与分支头通过辅助损失训练。可见性与补全尺度用于特征门控，暂不直接等同于交互重要性。

### 3.4 PKD：教师与学生如何对齐

每个训练样本生成同一当前时刻、同一坐标系、同一地图的长短历史视图。学生使用长度 $\tau_j$，教师使用候选长度集合中的相邻更长长度 $\tau_{j+1}$；共享主干，教师输出停止梯度，长短视图均接受预测监督。

LSEnc 的智能体 token 按跟踪标识匹配；若加入地图蒸馏，按车道标识匹配。只比较两视图共有且有效的对象，教师独有目标不强行加入学生。FIM 后先逆置换恢复身份，再对齐场景 token。未来 token 使用由**共同当前观测**生成的相同分支候选集，先按分支编号分组，再在分支内部按预测终点距离做匈牙利匹配；匹配本身停止梯度，不能假定相同 token 下标代表同一运动模式。

若扩展到 TEDec，沿用相同模式匹配，并对齐相同相对未来时刻的潜变量。无有效对应或教师预测明显不可靠的项应屏蔽或降权；阈值及其影响需要消融。

### 3.5 置信度感知 TEDec 与可选扩散细化

置信度感知 TEDec（Confidence-Aware TEDec，CA-TEDec）保留原解码结构，拟输出每个模式的轨迹均值、分布尺度及概率。分支感知软分配见 §5；它预期让多个合理模式获得训练信号，但不保证多样性或校准自动改善。

残差扩散细化器可在后续只处理排名靠前的少数粗轨迹，迭代次数与时延预算待定。生成式轨迹预测主动学习（Generative Active Learning for Trajectory Prediction，GALTraj）使用可控扩散进行训练期长尾样本增强，本文仅借鉴其长尾建模方向；它并不直接验证上述推理期细化方案。[GALTraj][3]

## 4) 训练流程：五个阶段的设计提纲（待实验）

阶段 1–3 对应 TaPD 的解耦训练路线；阶段 0 与阶段 4 是本文列出的可选补充。各阶段只启用适用的目标，损失定义见 §5。

| 阶段 | 输入与训练对象 | 拟启用目标 | 冻结或关闭项 |
| --- | --- | --- | --- |
| 0：可选掩码预训练 | 仅用训练划分，遮蔽历史点或车道片段，训练编码器和临时重建头 | 有效被遮蔽项上的重建损失 $\mathcal L_{\mathrm{mask}}$ | 尚不接 TBM；预训练头随后移除 |
| 1：训练 OAF 主干 | 真实轨迹裁短、连续缺失及晚进入模拟；训练预测、归一化和拓扑头 | 预测、中间监督、拓扑/锚点监督、PKD；先 WTA，后独立比较软分配 | OACF 不参与；无标签占用分支关闭 |
| 2：独立训练 OACF | 从有有效历史标签的片段制造缺失；训练 TBM 均值与尺度头 | $\mathcal L_{\mathrm{backfill}}$；有可靠标签时另训占用头并启用 $\mathcal L_{\mathrm{occ}}$ | OAF 冻结；不启用 PKD |
| 3：冻结前端后微调 | 混合原生完整历史与带掩码、尺度的补全历史，微调 OAF | 预测、中间监督及适用的拓扑/锚点目标 | OACF 冻结；PKD 关闭 |
| 4：可选校准与测试时适应 | 校准只使用独立校准划分；在线适应单独评测 | 校准模式分数/分布尺度；在线适应仅用当时可观测的自监督信号 | 校准时冻结预测主干；测试集未来标签不用于更新 |

掩码预训练可参考掩码自编码器（Masked Autoencoder，MAE）路线：Forecast-MAE 研究历史/未来轨迹的互补遮蔽及车道遮蔽；SmartPretrain 则结合对比与重建学习，并设计跨数据集场景采样。两者提供预训练方法依据，迁移到 FINet 的收益仍需验证。[Forecast-MAE][4]、[SmartPretrain][13]

仅解码器轨迹展开网络（Decoder-Only Network for Unrolling Trajectories，DONUT）的超出目标时域预测辅助任务也可作为单独实验，但应与掩码预训练分开归因。[DONUT][5] 测试时适应（Test-Time Adaptation，TTA）可参考基于掩码自编码器与智能体专属 token 记忆的轨迹预测测试时训练（Test-Time Training of Trajectory Prediction via Masked Autoencoder and Actor-specific Token Memory，T4P）；仅更新归一化参数或小型适配器是本文的候选约束，并非 T4P 的原始配置。[T4P][7]

## 5) 关键损失：按阶段启用的候选定义

以下公式是本文拟采用的实现起点，不是 FINet 或 TaPD 原损失的逐式复现。原始基线保留 FINet 的五项损失；Core 版沿用 WTA 轨迹与评分监督、中间监督，以多锚点对齐替代原参考点对齐，并加入 PKD 及适用的拓扑目标。软分配实验再替换相应预测与评分项。各权重、温度及阈值待验证集确定。

### A. 多模态预测与分支感知软分配

设未来有 $T$ 个有效时刻，模式 $k$ 输出均值 $\mu_t^k$、正定对角协方差 $\Sigma_t^k$ 和经 softmax 归一化的概率 $p_k$，满足 $\sum_k p_k=1$。单模式高斯负对数似然（Negative Log-Likelihood，NLL）为：

$$
\ell_k=-\sum_{t=1}^{T}\log\mathcal N(y_t;\mu_t^k,\Sigma_t^k).
$$

协方差通过正值参数化并设下界。令 $A_k,F_k$ 分别为模式的平均与最终位移误差，$B_k$ 为分支不匹配代价；距离按米制尺度 $s_A,s_F$ 归一化。无可靠分支标签时令 $B_k=0$，保留自由运动模式：

$$
D_k=A_k/s_A+F_k/s_F+\rho B_k,\qquad
q_k=\operatorname{sg}\!\left(\frac{\exp(-D_k/\theta)}{\sum_m\exp(-D_m/\theta)}\right),\quad\theta>0,
$$

$$
\mathcal L_{\mathrm{pred}}=\sum_k q_k\ell_k/T,\qquad
\mathcal L_{\mathrm{mode}}=-\sum_k q_k\log p_k.
$$

$\operatorname{sg}$ 表示停止梯度。该目标是加权单模式回归与评分监督；评测完整预测分布时另算混合 NLL：$-\log\sum_k p_k\exp(-\ell_k)$。温度过低可能接近硬分配，过高可能削弱模式区分，应与 WTA 比较。

中间监督 $\mathcal L_{\mathrm{int}}$ 对选定 TEDec 中间输出施加相同类型的轨迹及评分目标。对匹配明确的分支样本，可采用：

$$
\mathcal L_{\mathrm{topo}}=-\log\sum_{k:b(k)=j^*}p_k,\qquad
\mathcal L_{\mathrm{anchor}}=\operatorname{SmoothL1}(a_{j^*}-y_T).
$$

多分支歧义时使用软标签；未覆盖或不受车道约束的样本屏蔽上述分支项，仍保留轨迹监督。锚点监督不能被解释为所有模式都应贴近唯一真实终点。

### B. 相邻长度、多层 PKD

令 $\mathcal P$ 为相邻长度对集合，$\mathcal S$ 为选定蒸馏层集合，$V_l$ 为该层的有效匹配集合，$m_l(i)$ 为 §3.4 的教师对应项：

$$
\mathcal L_{\mathrm{pkd}}=
\frac{1}{|\mathcal P||\mathcal S|}
\sum_{(\tau_j,\tau_{j+1})\in\mathcal P}\sum_{l\in\mathcal S}
\frac{1}{|V_l|}\sum_{i\in V_l}
\left\|P_l f^{\tau_j}_{l,i}-\operatorname{sg}(f^{\tau_{j+1}}_{l,m_l(i)})\right\|_1.
$$

同维特征时 $P_l$ 为恒等映射，异维时使用投影；空匹配集合跳过。阶段 1 可令蒸馏权重随训练逐渐增加，阶段 3 设为零，避免补全分布下的持续对齐干扰原有表征。

### C. 补全与可选占用监督

令 $V_{it}$ 表示历史位置是否有有效真值标签，$R_{it}=V_{it}(1-M_{it})$，只在被隐藏且有真值的位置训练补全分布：

$$
\mathcal L_{\mathrm{backfill}}=
-\frac{\sum_{i,t}R_{it}\log\mathcal N(x_{it};\mu^x_{it},\Sigma^x_{it})}
{\max(1,\sum_{i,t}R_{it})}.
$$

速度、朝向重建可在标签可靠时后加；不存在有效历史标签的片段不生成伪真值。补全 NLL 同时训练均值与尺度，其尺度是否可信仍需检查覆盖率。

有占用监督时，以 $z_c$ 为查询区域标签，$A_c$ 为标签有效掩码，$o_c$ 为预测占用概率，使用掩码二元交叉熵（Binary Cross-Entropy，BCE）：

$$
\mathcal L_{\mathrm{occ}}=
-\frac{\sum_c A_c[z_c\log o_c+(1-z_c)\log(1-o_c)]}{\max(1,\sum_c A_c)}.
$$

未知区域不计入损失。没有 §3.2 所述监督时，$\lambda_{\mathrm{occ}}=0$，不报告隐藏占用预测收益。

### D. 与训练阶段对应

记 $\mathcal L_{\mathrm{forecast}}=\mathcal L_{\mathrm{pred}}+\lambda_{\mathrm{mode}}\mathcal L_{\mathrm{mode}}+\lambda_{\mathrm{int}}\mathcal L_{\mathrm{int}}$，则软分配版本的阶段 1 目标为：

$$
\mathcal L_1=\mathcal L_{\mathrm{forecast}}
+\lambda_{\mathrm{topo}}\mathcal L_{\mathrm{topo}}
+\lambda_{\mathrm{anchor}}\mathcal L_{\mathrm{anchor}}
+\lambda_{\mathrm{pkd}}(e)\mathcal L_{\mathrm{pkd}}.
$$

阶段 2 使用补全损失及条件允许时的占用损失；阶段 3 去掉 PKD，保留适用的预测与拓扑目标。额外模式排斥、熵正则、不确定性正则或扩散去噪损失均留作独立扩展，避免一次引入过多耦合目标。

## 6) 实施优先级与待验证假设

原有方向的取舍统一如下，后续按证据决定是否扩大框架：

| 优先级 | 方向 | 待验证的问题与主要代价 |
| --- | --- | --- |
| 首版 | 观测条件输入、带尺度补全、两层 PKD、单次拓扑排序 | 是否减少短历史误差，复杂路口是否受益；补全误差、错误地图匹配也可能造成负迁移 |
| 独立消融 | 软分配、掩码预训练、后处理校准 | 是否改善模式覆盖和置信度；需同时检查精度与校准，不能预设为“天然增益” |
| 数据允许后 | 隐藏占用 | 是否识别不可见交互风险；需要有效标签和独立的占用评测 |
| 后续扩展 | 多顺序扫描、残差扩散、连续记忆、TTA | 是否值得额外时延与状态维护成本；依赖具体部署条件 |
| 长期方向 | 世界模型 | 仅作预测、规划与仿真统一建模的背景，暂不纳入首版范围 |

校准可参考分布偏移下的保形不确定性量化（Conformal Uncertainty Quantification under Distribution Shift，CUQDS）；其高斯过程与在线校准机制并不等同于简单调整模式分数。[CUQDS][8] 连续记忆可参考 RealMotion 的场景上下文流和智能体轨迹流，只有具备连续日志与可靠关联标识时才安排实验。[RealMotion][9] 世界模型综述用于说明长期研究范围，不作为本方案有效性的证据。[世界模型综述][10]

本文的核心假设是：显式补全与置信度条件、路由拓扑和跨长度表征约束可能互补。补全能否减轻信息不足、拓扑锚点能否改善模式覆盖、软分配能否改善长尾，以及新增开销是否可接受，均应由 §7 的对照回答；不据此宣称已获得理论或实验优势。

## 7) 实验设计提纲（待实验）

**以下实验均未完成，不填写结果、排名或提升幅度。** 数字只表示拟采用的评测协议或候选配置。

### A. 数据、缺失模拟与分桶

拟先在 Argoverse 2 的官方训练/验证划分复现 FINet：沿用论文的 10 Hz 采样、50 步历史和 60 步预测协议，即名义历史窗口 5 秒、预测 6 秒。[FINet，§5.1][11] 归一化统计、预训练与补全训练只用训练划分；模型选择和校准在验证划分中另行留出的不重叠子集进行，按场景或日志分组，防止连续片段泄漏。最终测试只用于固定方案后的评测。

原稿中的 **Ts 指时间步（time steps），不是秒**。候选观测长度为 50、40、30、20、10、5 Ts；在 10 Hz 下按“步数/采样率”分别记为 5、4、3、2、1、0.5 秒的名义窗口。其他采样频率下需重新换算。

缺失模拟分别设置尾部保留的历史裁短、历史内连续丢帧、晚进入及整条邻居轨迹隐藏；所有设置保持同一预测起点。真实缺失与人工缺失分别报告，无遮挡标签的数据仅报告合成遮挡，不将其称为真实遮挡鲁棒性。

评测按五条轴拆分：观测长度、可见比例、首次观测时刻、可达分支/冲突区数量、交互密度与行为类别。先固定分桶规则与样本数，再评估各模型；稀疏桶需说明不确定性。

### B. 指标与计算口径

* 准确率：最小平均位移误差（minimum Average Displacement Error，minADE）、最小最终位移误差（minimum Final Displacement Error，minFDE）及漏预测率（Miss Rate，MR）。沿用同一官方评测器，固定模式数 $K$、筛选规则和 MR 阈值。
* 概率质量：混合 NLL、明确事件定义的 Brier 分数，以及预测区域覆盖率与区域大小。预期校准误差（Expected Calibration Error，ECE）需先定义事件，例如“最高分模式的终点误差是否低于固定阈值”，再固定分箱；不把任意模式分数直接当作校准概率。
* 结构与风险：驶离可行驶区比例、终点落在可达路由内的比例，以及有可靠尺寸和邻车未来标签时的碰撞代理指标。该代理指标不能替代闭环驾驶安全评测。
* 成本：统一硬件、批量、预热与计时边界，测完整推理时延和峰值显存；浮点运算量（Floating Point Operations，FLOPs）注明统计口径，纳入 TBM、图搜索、排序及扫描次数带来的成本。

跨长度鲁棒性采用本文定义的**观测长度误差曲线下面积**（Area Under the Curve，AUC）。令 $u_j$ 为递增的名义观测时长（秒），$E_j$ 为该长度的 minFDE：

$$
\operatorname{AUC}_{\mathrm{err}}=
\frac{1}{u_J-u_1}\sum_{j=1}^{J-1}
\frac{E_j+E_{j+1}}{2}(u_{j+1}-u_j).
$$

它是区间归一化的误差面积，单位为米，**越低越好**。所有模型使用相同长度网格与样本集合，并同时报告逐长度误差，避免平均值掩盖极短历史退化。

### C. 优先对照与消融

先建立原 FINet、仅做相同观测裁短训练的 FINet 两个参照，以区分训练增强与结构改动的作用。随后逐项加入观测条件与归一化、PKD、普通点估计 TBM、带尺度 TBM、拓扑排序；资源允许时再加入软分配、占用和掩码预训练。

重点做成对控制：普通补全与带尺度补全；每轮单参考点 ARS 与拓扑排序；单层与多层 PKD；仅 AOI 与关键邻居补全；WTA 与软分配。教师/学生匹配、候选覆盖率和错误补全案例也要检查。核心组合之外保留逐项移除实验，避免仅凭累加结果归因。

多锚点、多顺序扫描需分别核算增量成本。扩散细化和连续记忆仅在对应数据与预算具备时测试；连续记忆需按时间顺序运行并在日志边界重置。各对照使用一致预算和数据划分，重复运行并报告离散程度。所有结论保留为**待实验**，不预填任何结果。

## 参考文献

以下书目信息已逐条联网核对。格式统一为“作者，标题，会议或 arXiv 号，年份，链接”；作者姓名与论文标题保留原文，会议年份与预印本首发年份不混用。

1. Bernard Lange, Jiachen Li, Mykel J. Kochenderfer, *Scene Informer: Anchor-based Occlusion Inference and Trajectory Prediction in Partially Observable Environments*, ICRA, 2024, [原论文][1]。
2. Yixiao Chen, Ruining Yang, Xin Chen, Jia He, Dongliang Xu, Yue Yao, *From Static to Dynamic: a Survey of Topology-Aware Perception in Autonomous Driving*, arXiv:2509.23641, 2025, [原论文][2]。
3. Daehee Park, Monu Surana, Pranav Desai, Ashish Mehta, Reuben MV John, Kuk-Jin Yoon, *Generative Active Learning for Long-tail Trajectory Prediction via Controllable Diffusion Model*, ICCV, 2025, [原论文][3]。
4. Jie Cheng, Xiaodong Mei, Ming Liu, *Forecast-MAE: Self-supervised Pre-training for Motion Forecasting with Masked Autoencoders*, ICCV, 2023, [原论文][4]。
5. Markus Knoche, Daan de Geus, Bastian Leibe, *DONUT: A Decoder-Only Model for Trajectory Prediction*, ICCV, 2025, [原论文][5]。
6. Bernard Lange, Masha Itkina, Jiachen Li, Mykel J. Kochenderfer, *Self-supervised Multi-future Occupancy Forecasting for Autonomous Driving*, RSS, 2025, [原论文][6]。
7. Daehee Park, Jaeseok Jeong, Sung-Hoon Yoon, Jaewoo Jeong, Kuk-Jin Yoon, *T4P: Test-Time Training of Trajectory Prediction via Masked Autoencoder and Actor-specific Token Memory*, CVPR, 2024, [原论文][7]。
8. Huiqun Huang, Sihong He, Fei Miao, *CUQDS: Conformal Uncertainty Quantification under Distribution Shift for Trajectory Prediction*, AAAI, 2025, [原论文][8]。
9. Nan Song, Bozhou Zhang, Xiatian Zhu, Li Zhang, *Motion Forecasting in Continuous Driving*, NeurIPS, 2024, [原论文][9]。
10. Tuo Feng, Wenguan Wang, Yi Yang, *A Survey of World Models for Autonomous Driving*, arXiv:2501.11260, 2025, [原论文][10]。
11. Shijie Li, Chunyu Liu, Xun Xu, Si Yong Yeo, Xulei Yang, *Future-Aware Interaction Network For Motion Forecasting*, ICCV, 2025, [原论文][11]。
12. Mingyu Fan, Yi Liu, Hao Zhou, Deheng Qian, Mohammad Haziq Khan, Matthias Raetsch, *TaPD: Temporal-adaptive Progressive Distillation for Observation-Adaptive Trajectory Forecasting in Autonomous Driving*, arXiv:2603.06231, 2026, [原论文][12]。
13. Yang Zhou, Hao Shao, Letian Wang, Steven Waslander, Hongsheng Li, Yu Liu, *SmartPretrain: Model-Agnostic and Dataset-Agnostic Representation Learning for Motion Prediction*, ICLR, 2025, [原论文][13]。

[1]: https://arxiv.org/abs/2309.13893
[2]: https://arxiv.org/abs/2509.23641
[3]: https://arxiv.org/abs/2507.22615
[4]: https://arxiv.org/abs/2308.09882
[5]: https://arxiv.org/abs/2506.06854
[6]: https://arxiv.org/abs/2407.21126
[7]: https://arxiv.org/abs/2403.10052
[8]: https://arxiv.org/abs/2406.12100
[9]: https://arxiv.org/abs/2410.06007
[10]: https://arxiv.org/abs/2501.11260
[11]: https://openaccess.thecvf.com/content/ICCV2025/html/Li_Future-Aware_Interaction_Network_For_Motion_Forecasting_ICCV_2025_paper.html
[12]: https://arxiv.org/abs/2603.06231
[13]: https://proceedings.iclr.cc/paper_files/paper/2025/hash/789a0b275424cb36f66d7bd3506b3be4-Abstract-Conference.html
