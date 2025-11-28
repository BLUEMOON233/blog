---
title: TransDiffuser
date: 2025-11-28
category: 论文笔记
tags:
  - 轨迹生成
  - 自动驾驶
description: 
---

# TransDiffuser: Diverse Trajectory Generation with Decorrelated  Multi-modal Representation for End-to-end Autonomous Driving

## 论文信息
- 年份 2025
- 期刊 未发表
- 作者 Xuefeng Jiang[1,2], Yuan Ma[1,3], Pengxiang Li[1,3], Leimeng Xu[1], Xin Wen[1], Kun Zhan[1†], Zhongpu Xia[1], Peng Jia[1], Xianpeng Lang[1], Sheng Sun[2†]
- 机构 理想汽车、中国科学院计算技术研究所、清华大学汽车与交通学院

## 摘要
近年来，扩散模型在从视觉生成到语言建模等不同领域都表现出了巨大的潜力。将其生成能力应用于现代端到端自动驾驶系统也已成为一个很有前景的方向。然而，现有的基于扩散的轨迹生成模型往往表现出模式崩溃，即不同的随机噪声在去噪处理后趋同于相似的轨迹。因此，最先进的模型通常依赖训练集中预定义轨迹词汇或场景先验中的锚定轨迹来缓解塌陷并丰富生成轨迹的多样性，但这种归纳偏差在真实世界的部署中并不存在，这在泛化到未见场景时可能会面临挑战。在这项工作中，我们研究了在不假设预定义轨迹词汇或预先计算场景先验的情况下有效解决模式崩溃挑战的可能性。具体来说，我们提出了基于编码器解码器的生成式轨迹规划模型 TransDiffuser，其中编码的场景信息和运动状态可作为去噪解码器的多模态条件输入。与现有方法不同的是，我们在去噪过程中利用一种简单而有效的多模态表征相关性优化机制来丰富潜在表征空间，从而更好地指导下游生成。在没有任何预定义轨迹锚点或预计算场景先验的情况下，TransDiffuser 在面向闭环规划的基准 NAVSIM 上实现了 94.85 的 PDMS，超越了之前的先进方法。定性评估进一步表明，TransDiffuser 生成的轨迹更多样、更合理，能探索更多可驾驶区域。

## 主要贡献

- 提出了 TransDiffuser 模型：我们提出了一种基于编码器-解码器架构的生成式轨迹模型 TransDiffuser。该模型首先对**自车（ego vehicle）**的场景感知和运动状态进行编码，然后将编码后的信息作为去噪解码器的条件输入，从而解码出多模态、多样化且可行的轨迹。

- 解决了模式坍塌问题：与现有依赖预定义轨迹或预计算场景先验的工作不同，我们在去噪过程中利用了一种计算高效的多模态表示去相关机制（multi-modal representation decorrelation mechanism）。这种机制增强了生成轨迹的多样性，从而解决了模式坍塌（model collapse）的难题。

- 实现了 SOTA 性能：我们在 NAVSIM 基准测试中达到了新的最先进水平（State-of-the-art），PDMS 得分为 94.85。这一成绩是在没有任何如预定义锚点轨迹或场景先验等显式引导的情况下取得的。定性分析表明，TransDiffuser 生成的轨迹既多样又可行，能够更好地探索可行驶区域。

## 要点
- GoalFlow 通过建立密集的目标点词汇库，在轨迹生成过程中加入场景先验约束， DiffusionDrive 着眼于模式坍塌，轨迹生成缺乏多样性，通过分割为子高斯分布来进行初始化。但是这两种办法通常都需要预先定义锚轨迹的先验，**这就引入了归纳偏置，在未知场景中可能会面临挑战。**
- 该论文发现了导致模式崩溃的一个潜在瓶颈，不同模态条件输入的多模态编码表征未得到充分利用。
- 该论文受self-supervised representation learning（自监督表征学习）启发，设计了一种在去噪过程中高效且有效的、即插即用的、多模态表征相关性优化机制

::: tip Representation Learning
Representation Learning（表征学习）， 学习到数据的一种有效表示，使得后续的任务（如分类、聚类）更容易完成，2025年SOTA主流是采用Self-Supervised Learning（自监督学习），例如对比学习（拉近正样本，推远负样本。代表模型SimCLR）、掩码建模（遮住图片或文本的一部分，让模型去预测被遮住的内容，代表模型BERT, MAE）。
:::

## 数据集
NAVSIM数据集，进行非反应模拟和闭环评估

## 算力需求
4 * NVIDIA H20 GPU for 120epochs\
BATCHSIZE = 256