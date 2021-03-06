---
title: "Tractography and Feature extraction"

classes: wide

permalink: /dMRI/tractography/

categories:
  - Neuroimaging

tags:
  - dMRI
  - HCP

sidebar:
  nav: "dmri"
---
![Estimated FOD via BJS](/assets/images/dmri/tractography.png)


## Tractography and Feature Extraction

This part is done in *R*. 

**Data**:  in */data* folder: 

- HCP_peaks.mat: extracted peak of estimated FODs. These are used as inputs for the tracking algorithm.

**Example script**: in */example_scripts* folder: 

- example_HCP_tractography.R: this is the script to run the tracking algorithm on the HCP application 
  - Input: HCP_peaks.mat
  
**R package**: in */dmri.tracking-r*

- dmri.tracking_0.1.0.tar.gz: R package for tracking algorithm and tractography.