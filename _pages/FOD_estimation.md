---
title: "FOD estimation and Peak Detection"

classes: wide

permalink: /dMRI/fod_estimation/

categories:
  - Neuroimaging

tags:
  - dMRI
  - HCP

sidebar:
  nav: "dmri"
---

![Estimated FOD via BJS](/assets/images/dmri/bjs.png)

## FOD Estimation and Peak Detection
This part is done in *python* and *matlab*.

**Data**: in  */data* folder: 

- For HCP application: 
	- bvals: b-values
	- bvecs: gradient directions
	- data_brain_flirt.nii.gz: whole brain dMRI (This is not given in the repository since registration on connectome DB is required to access these data)
	- Caudate(R).nii.gz: mask of ROI (Caudate in the right hemisphere)
	- Caudate(R)_noise.nii.gz: faked image for Caudate in the right hemisphere (original signals with artificially added small noises)
- FOD plotting example: 
	- est_result.mat: The mean and sd of the estimated FODs from 100 numerical simulation.

**Example scripts**: in */example_scripts* folder: 

- example_simulation_fib2.py: simulation example where the true FOD has two peaks
- example_simulation_fib3.py: simulation example where the true FOD has three peaks
- example_HCP_analysis.py: script to run HCP data application
  - Input: bvals, bvecs, Caudate(R).nii.gz, Caudate(R)_noise.nii.gz
  - Output: HCP_peaks.mat
- example_plot_fod.m: script to plot the estimated FOD in matlab
  - Input: est_result.mat

**Python codes**: in */python* folder: 

- dwi_simulation.py: For simulating dMRI signals and evaluation of simulation results on FOD estimation. 
- fod_estimation.py: Functions for the three FOD estimation methods BJS, SHridge and superCSD
- fod_HCP_application.py: Functions for HCP data processing including 1--Estimation of response function parameters, 2--ROI information organization, 3--Gradient direction extraction according to b-value groups
- FOD_peak.py: Functions for the peak detection algorithm. 
- sphere_harmonic.py: Functions to evaluate the spherical harmonic basis in spherical grid.
- sphere_mesh.py: Functions for sampling schemes on the sphere. 

**Matlab codes**: in */matlab* folder:

- fod_plotting: Functions for plotting estimated FOD 