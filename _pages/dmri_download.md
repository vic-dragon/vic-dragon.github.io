---
title: "HCP dMRI data download"

classes: wide

permalink: /dMRI/download/

categories:
  - Neuroimaging

tags:
  - dMRI
  - HCP

sidebar:
  nav: "dmri"
---

This section describes how to download and process diffussion MRI (dMRI) data from the Human Connectome Project (HCP) database using various *neuroconductor* R packages (https://neuroconductor.org/)

## HCP dMRI data download
**Step 1**: Obtain ***AWS* access credential** -- *access key id* and *secret key*: Login  [*ConnectomeDB*](https://db.humanconnectome.org/app/template/Login.vm) account and then click the **Amazon S3 Access Enabled** box. If you do not have an account, you need to first create one. 

![Wu-Minn HCP Data webpage.](/assets/images/dmri/connectome.png)

**Step 2**: Install the [*neurohcp* R package](https://neuroconductor.org/package/neurohcp) for batch downloading from *ConnectomeDB*.

**Step 3**: Obtain subject ID using the **hcp_1200_scanning_info** function in the *neurohcp* package. 

```r
library(neurohcp)
set_aws_api_key(access_key = "your_access_key", secret_key = "your_secret_key")
hcp_info=hcp_1200_scanning_info # information of the database
hcp_id=hcp_info$id #ID of available subjects
```

Two functions are used to download data from *ConnectomeDB*: 

 - **download_hcp_dir**: To download all files in a certain directory
 
 - **download_hcp_file**: To download a certain file
 
For each subject, the following files (approximately, 1.5GB) are relevant to our analysis:

- *T1w_acpc_dc_restore_1.25.nii.gz*: T1w image (structural volume sampled at the same resolution as the diffusion data)
- *data.nii.gz*: diffusion weighted image 
- *bvecs*: gradient directions
- *bvals*: b-values
- *nodif_brain_mask.nii.gz*: T2w extracted brain mask

```r
## Download D-MRI directory of a subject
# "100307" is the subject ID; an output directory should also be specified: default: tempfile()
download_hcp_dir("HCP/100307/T1w/Diffusion",verbose=FALSE, outdir="user_path")  

## Downlaod the T1w image of a subject
# an output file path/name should also be specified: default: NULL
download_hcp_file("HCP/100307/T1w/T1w_acpc_dc_restore_1.25.nii.gz", verbose = FALSE,
                  destfile="user_path/out_file_name") 
```

**Notes:** Sometimes, the files of a subject found through **hcp_1200_scanning_info** could not be downloaded through either **download_hcp_dir** or **download_hcp_file** function. This problem occurs due to one of the two reasons:

* Data of this subject have not been registered on *ConnectomeDB*.
* Data have not been registered with proper directory path, even though the data are available on *ConnectomeDB*. 

You can check whether data of a subject are available on *ConnectomeDB* by using the **hcp_list_dirs** function:  If the result from **hcp_list_dirs** does not have any value in *parsed_result$Contents$Key[[1]]*, it means that you will have to manually check the availability of files.

```r
dir_info=hcp_list_dirs(paste0("HCP/100307/T1w/Diffusion"))

#Check whether D-MRI can be downloaded thorugh the "download_hcp_dir" function.
is.null(dir_info$parsed_result$ListBucketResult$Contents$Key[[1]]) 
 
```