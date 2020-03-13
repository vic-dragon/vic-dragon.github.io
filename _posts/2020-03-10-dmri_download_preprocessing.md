---
title: "HCP dMRI data download and preprocessing"


categories:
  - Neuroimaging
tags:
  - dMRI
  - HCP

last_modified_at: 2020-03-13T10:01:00-00:00
---

## HCP dMRI data preprocessing
This section describes how to download and process diffussion MRI (dMRI) data from the Human Connectome Project (HCP) database using various *neuroconductor* R packages (https://neuroconductor.org/)

## HCP dMRI data download

**Step 1**: Obtain AWS access credential. Your AWS access credential (access key id and secret key) is available on https://db.humanconnectome.org/app/template/Login.vm. You need to log-in your ConnectomeDB account and then click the **Amazon S3 Access Enabled** box. If you do not have an account, you need to first create one. 


![Wu-Minn HCP Data webpage.](/assets/images/dmri/connectome.png)

**Step 2**: You need to install the *neurohcp* R package (https://neuroconductor.org/package/neurohcp) for batch downloading from HCP database.

**Step 3**: You can find ID of available subjects through the **hcp_1200_scanning_info** function in the *neurohcp* package. Two functions are usually used to download data from  ConnectomeDB: 

 - **download_hcp_dir**: To download all files in a certain directory. 
 
 - **download_hcp_file**: To download a certain file
 
```R
library(neurohcp)
set_aws_api_key(access_key = "your_access_key", secret_key = "your_secret_key")
hcp_info=hcp_1200_scanning_info # Information of the database
hcp_id=hcp_info$id #ID of available subjects

## Download the dMRI directory of a subject: five files (1.3GB) 
# including
# 1) dMRI data (data.nii.gz), 
# 2) gradient directions (bvecs), 
# 3) b-values (bvals),
# 4) brain mask (nodif_brain_mask.nii.gz),
# 5) effects of gradient nonlinearities on the bvals and bvecs for each voxel (grad_dev.nii.gz)

# "100307" is the subject ID; an output directory should also be specified: default: tempfile()
download_hcp_dir("HCP/100307/T1w/Diffusion",verbose=FALSE, outdir="user_path")  

# Downlaod the T1w image of a subject: 
#  - structural volume sampled at the same resolution as the diffusion data
# "100307" is the subject ID; 
#  - an output file path/name should also be specified: default: NULL
download_hcp_file("HCP/100307/T1w/T1w_acpc_dc_restore_1.25.nii.gz", verbose = FALSE,
                  destfile="user_path/out_file_name") 
```


**Notes**: Sometimes, the corresponding files of an ID found through **hcp_1200_scanning_info** could not be downloaded through either **download_hcp_dir** or **download_hcp_file**. This problem can occur due to two reasons.

* The first is that the dMRI data of this subject has not been registered on ConnectomeDB.
* The second  is that the dMRI data has not registered with proper directory path on AWS, even though the data is available on ConnectomeDB. 

You can check whether the dMRI data is available on AWS by using the **hcp_list_dirs** function:  If the result from **hcp_list_dirs** does not have any value in *parsed_result$Contents$Key[[1]]*, it means you need to check the availability of file, manually.

```R
dir_info=hcp_list_dirs(paste0("HCP/100307/T1w/Diffusion")) 
#Check whether dMRI can be downloaded thorugh the "download_hcp_dir" function.
is.null(dir_info$parsed_result$Contents$Key[[1]]) 
```


## HCP dMRI data preprocessing: brain extraction and registration

The *fslr* R package from *neuroconductor* (https://neuroconductor.org/package/fslr) is needed here.  Also, you need to install **FSL** on your computer (https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/FslInstallation). The *fslr* package is a wrapper of **FSL**.

```R
library(fslr)
```


**Step 1 -- BET extraction** (https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/BET): This tool deletes non-brain tissue from an image of the whole head. The resulting image is  used as input for registration (Step 2). 
```R
##BET step
# input: data.nii.gz -- the original dMRI data (from "download" step)
# output: data_brain.nii.gz -- extracted brain dMRI
fsl_bet(infile="/user_path/data.nii.gz", outfile="/user_path/data_brain.nii.gz")  

# input: T1w_acpc_dc_restore_1.25.nii.gz -- the original T1 image (from "download" step)
# output: T1w_brain.nii.gz -- extracted T1 image.
fsl_bet(infile="/user_path/T1w_acpc_dc_restore_1.25.nii.gz", 
        outfile="/user_path/T1w_brain.nii.gz")
```


**Step 2 -- FLIRT registration** (https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/FLIRT): This is a fully automated tool for linear (affine) intra- and inter-modal brain image registration. The brain image is registered to a template image.
Both linearly and non-linearly generated MNI152 template images (whole head, extracted brain, brain mask and skull) are included in the folder /usr/local/fsl/data/standard/, courtesy of the MNI.

```R
## Registration step
# (a) obtain transformation matrix based on T1 image registration
# input:  T1w_brain.nii.gz -- extracted T1 image (from "BET" step), 
#         MNI152_T1_2mm_brain.nii.gz -- template image (from FSL)
# output: T1w_brain_flirt.nii.gz -- registered T1 image, 
#         flirt.mat -- transformation matrix 
# parameter: dof=12 means affine transformation
flirt(infile="/user_path/T1w_brain.nii.gz", 
        outfile="/user_path/T1w_brain_flirt.nii.gz", 
        omat="/user_path/flirt.mat",
        dof=12, reffile="/usr/local/fsl/data/standard/MNI152_T1_2mm_brain.nii.gz")


# (b) register dMRI  using the registration matrix from (a) 
# input: data_brain.nii.gz -- extracted dMRI (from "BET" step)
#        flirt.mat -- registration transformation matrix (from (a)), 
#        MNI152_T1_2mm_brain.nii.gz -- template image (from FSL)
# output: data_brain_flirt.nii.gz -- registered dMRI
flirt_apply(infile="/User/data_brain.nii.gz",
              outfile="/User/data_brain_flirt.nii.gz",
              reffile="/usr/local/fsl/data/standard/MNI152_T1_2mm_brain.nii.gz",
              initmat="/User/flirt.mat")
```

