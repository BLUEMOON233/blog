---
title: OptTrajDiff学习笔记
date: 2025-11-28
category: 论文笔记
tags:
  - 轨迹生成
description: 对OptTrajDiff的论文的学习总结
---

# Optimizing Diffusion Models for Joint Trajectory  Prediction and Controllable Generation

## 论文信息
- 年份 2024
- 期刊 ECCV
- 作者 Yixiao Wang[1], Chen Tang[1,2], Lingfeng Sun[1], Simone Rossi[3], Yichen Xie[1], Chensheng Peng[1], Thomas Hannagan[3], Stefano Sabatini[3], Nicola Poerio[4], Masayoshi Tomizuka[1], and Wei Zhan
- 机构 美国加州大学伯克利分校、美国德克萨斯大学奥斯汀分校、斯特兰蒂斯

## 摘要
扩散模型在自动驾驶的联合轨迹预测和可控生成方面大有可为，但它们面临着推理步骤效率低和计算需求高的挑战。为了应对这些挑战，我们引入了最优高斯扩散（OGD）和估计清洁歧面（ECM）指导。OGD 优化小扩散时间 T 的先验分布，并以此为基础启动反向扩散过程。ECM 直接将引导梯度注入估计清洁流形，消除了整个网络中大量的梯度反向传播。我们的方法简化了生成过程，在实际应用中减少了计算开销。大规模 Argoverse 2 数据集的实验验证证明了我们的方法性能优越，为自动驾驶提供了计算高效、高质量的联合轨迹预测和可控生成的可行解决方案。我们的项目网页是 https://yixiaowang7.github.io/OptTrajDiff_Page/

## 创新思路
- 首先，我们提出了优化高斯扩散法（OGD），以加速反向扩散过程。在推理阶段，OGD 从最优高斯分布开始，而不是远离所需的数据分布的标准高斯分布，该分布在特定噪声水平下与中间数据分布的距离最小，从而减少了之前的扩散步骤。
- 其次，我们提出了估计清洁流形引导（ECM）来加速可控生成的引导采样。可以理解为直接将梯度作用于当前的干净样本 $x_0$，给 $x_0(k)$ 加上强度为 $t_k$ 的噪声，把它变成 $x_{t_k}$ ，把样本稍微“打散”一点，让扩散模型有机会重新整理它，即直接在这个干净的 $\hat{x}_0(k)$ 上计算成本函数 $\mathcal{J}$ 的梯度，并沿着梯度的反方向移动一小步。

## 要点
- 论文认为计算效率是阻碍扩散模型在自动驾驶中实际应用的关键瓶颈。归因于两个方面
    1. 计算密集的反向扩散：目标数据分布可能与标准高斯分布有很大不同，因此需要大量的去噪步骤才能获得良好的性能。
    2. 计算密集型引导采样：可控生成利用成本函数的梯度来引导去噪来实现，每个去噪过程都需要进行一次生成和反向传播。

## 数据集
Argoverse 2

## 对比模型
- QCXet
- Gnet
- Forecast-MAE
- FJMP