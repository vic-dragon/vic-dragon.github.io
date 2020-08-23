---
title: "ROI Selection"

classes: wide

permalink: /dMRI/roi_selection/

categories:
  - Neuroimaging

tags:
  - dMRI
  - HCP

sidebar:
  nav: "dmri"
---

## ROI Masks Creation

This section describes how to select  *region of interest (ROI)* masks on the template space using  [**FSLeyes**](https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/FSLeyes). **FSLeyes** can be installed as part of **FSL**, or as a standalone software. 
A quick introduction of **FSLeyes** is available at https://fsl.fmrib.ox.ac.uk/fslcourse/lectures/practicals/intro1/index.html and a more complete overview is available at https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/FSLeyes.

**Step 1** : Load the template space used in  the registration step (here *'MNI152_T1_2mm.nii.gz'*). To load the template space image, in **FSLeyes**: 

File -> Add standard -> Choose *'MNI152_T1_2mm.nii.gz'*
![](/assets/images/dmri/roi0.png)


**Step 2** : Open the *Atlas Panel*: 

Settings -> Ortho View 1 -> Atlas Panel

![](/assets/images/dmri/roi1.png)

**Step 3**: In *Atlas Panel* (at the bottom of the window), choose an atlas and ROIs (here *JHU White Matter Tractography Atlas* and  *SLF-L, SLF-R*, respectively). The selected ROIs will be overlayed to the template image.

![](/assets/images/dmri/roi2.png)

**Step 4**:	Click the button (lower left corner, highlighted by red) to save the mask(s) of the selected ROI(s) as .nii.gz file(s). These mask files will be warped back to subject native spaces. 

![](/assets/images/dmri/roi3.png)