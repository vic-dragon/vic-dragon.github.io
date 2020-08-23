---
title: "Pipeline of dMRI processing"

classes: wide

permalink: /dMRI/

sidebar:
  nav: "dmri"
---

<img src= "/assets/images/dmri/pipeline.png" width="925"> <!--- usemap="#dMRIPipeline"> --->

<!---
<map name="dMRIPipeline"> 
  <area shape="rect" coords="6, 9, 919, 230" href="/dMRI/download_preprocessing/" target="_blank"/>
  <area shape="rect" coords="6, 265, 115, 480" href="/dMRI/roi_selection/" target="_blank"/>
  <area shape="rect" coords="135, 265, 450, 480" href="/dMRI/fod_estimation/" target="_blank"/>
  <area shape="rect" coords="470, 265, 760, 480" href="/dMRI/tractography/" target="_blank"/>
</map>
--->
# Supporting software requirements: 

* R(version 3.6.2)
  - required R packages (rgl, R.matlab, dmri.tracking, neurohcp, fslr)
* python3(3.7.6)
  - required python3 packages (numpy, scipy, tqdm, nibabel, warnings)
* matlab(R2017a) 
* FSL(version 6.0.3)
* Xquartz (version 2.7.11)

* Github: https://github.com/vic-dragon/BJS