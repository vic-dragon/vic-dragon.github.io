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

This page describes how to select a region of interest on the template brain in the **FSL** image viewer: **FSLeyes**. If **FSL** is already installed on your computer in the previous step, **FSLeyes** can be used without further installation. Basic configuration of **FSLeyes** is available on (https://fsl.fmrib.ox.ac.uk/fslcourse/lectures/practicals/intro1/index.html)

### Step 1  
You have to load the template image which you have used in FLIRT registration step. In our registration step, we used "MNI152_T1_2mm_brain.nii.gz" as a template. To load this template image, in **FSLeyes**, 

File -> Add standard -> Choose MNI152_T1_2mm_brain.nii.gz.

### Step 2
Based on the available Atalases in **FSLeyes**, we can explore each part of brain. 

Settings -> Ortho View 1 -> Atlas Panel

![](/assets/images/dmri/roi1.png)

### Step 3
In “Atlases” Panel (at the bottom of the window), choose an atlas and a prespecified brain region: Click on the atlas search bar and search the part of brain (e.g., “putamen”). Then, the selected part of brain ("putamen") is projected onto the template image.

![](/assets/images/dmri/roi2.png)

### Step 4
Click the button (highlighted by red)  to save the mask of the selected ROI as an .nii.gz file. This file will be used in the subsequent data analysis.

![](/assets/images/dmri/roi3.png)