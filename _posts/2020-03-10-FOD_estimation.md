---
title: "FOD estimation and Peak Detection"

categories:
  - Neuroimaging
tags:
  - dMRI
  - HCP
  
last_modified_at: 2020-03-10T10:03:00-02:00
---

![Estimated FOD via BJS](/assets/images/dmri/bjs.png)

## FOD Estimation and Peak Detection
This part is done in *python* and *matlab*.

**Data**

* HCP data examples: bvals, bvecs, data_brain_flirt.nii.gz, Caudata(R).nii.gz
* FOD plotting example: est_result.mat

**Example**

* example_simulation_fib2.py
* example_simulation_fib3.py
* example_HCP_analysis.py
* example_plot_fod.m

**Python**

* dwi_simulation.py: For numerical simulation and evaluation of FOD estimation.
* fod_estimation.py: Set of functions for FOD estimation. (BJS, SHridge, superCSD)
* fod_HCP_application.py: HCP data processing including ( 1--Estimation of response function parameters, 2--ROI information organization, 3--Gradient direction extract according to b-value)
* FOD_peak.py: peak detection algorithm. And the functions to apply for ROI.
* sphere_harmonic.py: Set of functions to evaluate the spherical harmonic basis.
* sphere_mesh.py: Set of functions for sampling scheme on the sphere

**Matlab**

* fod_plotting: The set of Matlab functions for plotting