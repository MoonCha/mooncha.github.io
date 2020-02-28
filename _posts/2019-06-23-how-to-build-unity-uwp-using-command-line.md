---
title: How to build Unity UWP project and bundle into .appxbundle or .appxupload
author: MoonCha
layout: post
categories: [UWP, MICROSOFT, WINDOWS, DEVELOPMENT, CI/CD]
---

## TL;DR

1) Build Unity Project with UWP as build target

2) Execute `nuget restore "${product_name}.sln"`

3) Repeat [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild?view=vs-2017) for each TARGET_ARCHITECTURE(e.g. x86, x64, ARM) you want to bundle.

> Git Bash Command: `"/C/Program Files (x86)/Microsoft Visual Studio/2017/Community/MSBuild/15.0/Bin/msbuild.exe" "${product_name}.sln" -p:Platform="${TARGET_ARCHITECTURE}" -p:Configuration=Master -p:AppxBundle=Never -p:AppxBundlePlatforms="${TARGET_ARCHITECTURE}" -p:UapAppxPackageBuildMode="SideloadOnly"`

### Bundle into .appxbundle

4) Copy built *.appx into an empty directory.

> Git Bash Command: `/usr/bin/find "./AppPackages/${product_name}" -maxdepth 2 -name '*.appx' -exec cp -f {} ./${PACKAGE_DIR}/ \\;`

5) Bundle *.appx using [makeappx.exe](https://docs.microsoft.com/en-us/windows/desktop/appxpkg/make-appx-package--makeappx-exe-)  ([reference](https://docs.microsoft.com/en-us/windows/uwp/packaging/create-app-package-with-makeappx-tool#create-an-app-package))

> Git Bash Command: `"/C/Program Files (x86)/Windows Kits/10/bin/x64/makeappx.exe" bundle -d "${PACKAGE_DIR}" -p result.appxbundle`

6) Sign result.appxbundle using [signtool.exe](https://docs.microsoft.com/en-us/dotnet/framework/tools/signtool-exe) with your keyfile ([reference](https://docs.microsoft.com/en-us/windows/uwp/packaging/sign-app-package-using-signtool))

> Git Bash Command: `"/C/Program Files (x86)/Windows Kits/10/bin/x64/signtool.exe" sign -fd SHA256 -a -f "./Your_StoreKey.pfx" result.appxbundle`

### Bundle into .appxupload

4) Copy built *.appx and *.appxsym.

> Git Bash Command: `"/usr/bin/find "./AppPackages/${product_name}" -maxdepth 2 \( -name '*.appx' -o -name '*.appxsym' \) -exec cp -f {} ./ \;"`

5) Zip files into .appxupload file ([reference](https://docs.microsoft.com/en-us/windows/uwp/packaging/packaging-uwp-apps#create-your-app-package-upload-file-manually))

> Git Bash Command: `zip result.appxupload *.appx *.appxsym`


---

### Background

I recently worked on building Unity UWP project using Jenkins CI. Some functionalities only accessable through GUI are not available options for CI build. Thus, I should build Unity UWP project only by command-line.

### Main Obstacles

While I was working on building Unity UWP project, I met some problems that took pretty much time to solve:

1. Build fails due to dependencies on NuGet Packages

2. [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild?view=vs-2017) does not support bundling multiple platforms (However, Pacakge Wizard in Visual Studio bundle multiple platforms at once)

First problem occurs due to Unity UWP project's characteristics.

### Unity UWP project build process

Seeing [Unity document about UWP build result](https://docs.unity3d.com/Manual/windowsstore-generatedproject-il2cpp.html), we can modify build result's main project.

> The main project (it name matches your Unity project name). This is the project that will be built into an application package, which may be deployed to a device or uploaded to the Windows Store. Unity will not overwrite this project when built on top of it, so it can be modified freely without the fear of changes becoming lost.

Due to the behavior, we can add some native functions and 3rd-party packages like Facebook SDK. Thus I copied the pristine build result and added [winsdkfb](https://github.com/microsoft/winsdkfb)(one of NuGet packasges), and native implemenation for push notifications, image load and so on. I put them to source control, and I filtered some unnecessary files like downloaded NuGet packages after reading a [document](https://docs.microsoft.com/en-us/nuget/consume-packages/packages-and-source-control). Then I modified CI system to copy them before build start. Unity will preserve modified project and we can proceed building our custom UWP project.

### Build failure by missing NuGet package

However, my custom UWP project failed building project with error message that it cannot find winsdkfb package.

```plain
Error	C2653	'winsdkfb': is not a class or namespace name ${project_name}	c:\users\user\desktop\native_project\...
Error	C2871	'winsdkfb': a namespace with this name does not exist	${project_name}	c:\users\user\desktop\native_project\...
```

I didn't think that NuGet dependency error because I turned "Package Restore" option on following [this document](https://docs.microsoft.com/en-us/nuget/consume-packages/package-restore#migrating-to-automatic-restore). Anyway it happened, so I tried to research how to manually restore them. I used `msbuild.exe -t:restore`, but It had no effect. I found from the document above that msbuild's restore only works for packcages managed by PackageReference, but my project used `packages.config` for packcages management.

> **MSBuild**: use the msbuild -t:restore command, which restores packages packages listed in the project file (PackageReference only). Available only in NuGet 4.x+ and MSBuild 15.1+, which are included with Visual Studio 2017. `nuget restore` and `dotnet restore` both use this command for applicable projects.

Unlike the description that `nuget restore` uses msbuild restore, `nuget restore` just worked fine. Build successfuly finished after I execute ``nuget restore "${product_name}.sln"``.

**NOTE:** `nuget` is involved in Visual Studio, but not in .exe form, so you need to download it separately. see [this](https://docs.microsoft.com/en-us/nuget/install-nuget-client-tools#cli-tools) to install.

### Bundle multiple architectures' appx file

I wanted build to result in '*.appxbundle' or '*.appxupload' file, which involves several appx files like Visual Studio's Packcage Wizard results in. Thus I executed `"/C/Program Files (x86)/Microsoft Visual Studio/2017/Community/MSBuild/15.0/Bin/msbuild.exe" "${product_name}.sln" -p:Configuration=Debug -p:AppxBundle=Always -p:AppxBundlePlatforms="x86|x64" -p:UapAppxPackageBuildMode="SideloadOnly"` with Git, but it failed with error messages:

```
  LINK : fatal error LNK1104: cannot open file 'C:\Users\user\Desktop\NATIVE_PROJECT\build\bin\ARM\Debug\x86\${product_name}\GameAssembly.lib' [C:\Users\user\Desktop\NATIVE_PROJECT\${product_name}\${product_name}.vcxproj]
    20 Warning(s)
    1 Error(s)
```

I searched something like `msbuild bundle multiple platforms` and tried some solutions, but no solution could bundle multiple platforms' appx only by single execution of msbuild. I ended up concluding no solution for bundling appx with single command exists. Thus I planned to build each appx file and bundle them manually.
```
Wanted, but impossible
[ MSBuild -> .appxbundle, .appxupload ] ---> DONE!

Changed process
[ MSBuild -> .appx ] * n ---> [ Bundle Manually -> .appxbundle, .appxupload ] ---> DONE!
```

I executed `msbuild` multiple times to create .appx file for each platforms (x86, x64, ARM). Then I followed [this document](https://docs.microsoft.com/en-us/windows/uwp/packaging/packaging-uwp-apps#create-your-app-package-upload-file-manually) to create .appxupload file manually. Just copy *.appx and *.appxsym file into the directory, and zip all *.appx and *.appxsym file with result file name 'something.appxupload'. That was an easy stuff.

Creating .appxbundle was a little bit harder than .appxupload. After searching internet more, I also found the way to bundle .appx files into .appxbundle file. First, copy all *.appx file into an empty directory. Second, create .appxbundle file using [makeappx.exe](https://docs.microsoft.com/en-us/windows/desktop/appxpkg/make-appx-package--makeappx-exe-) executable. I executed a command in Git Bash:

```bash
"/C/Program Files (x86)/Windows Kits/10/bin/x64/makeappx.exe" bundle -d "${PACKAGE_DIR}" -p result.appxbundle
```

`MakeAppx.exe` is bundled with Windows SDK. see [reference](https://docs.microsoft.com/en-us/windows/uwp/packaging/create-app-package-with-makeappx-tool#create-an-app-package) for detailed instruction.

Third, sign the .appxbundle with [signtool.exe](https://docs.microsoft.com/en-us/dotnet/framework/tools/signtool-exe). You should use SHA256 for sign algorithm by this reason:

> When using **SignTool** to sign your app package or bundle, the hash algorithm used in **SignTool** must be the same algorithm you used to package your app. For example, if you used **MakeAppx.exe** to create your app package with the default settings, you must specify SHA256 when using **SignTool** since that's the default algorithm used by **MakeAppx.exe**.

With your certificate file `Your_StoreKey.pfx` specified in project's .appmanifest file for code signing, you may run command in Git Bash like:
```bash
"/C/Program Files (x86)/Windows Kits/10/bin/x64/signtool.exe" sign -fd SHA256 -a -f "./Your_StoreKey.pfx" result.appxbundle
```

`SignTool.exe` is also bundled with Windows SDK. see [reference](https://docs.microsoft.com/en-us/windows/uwp/packaging/sign-app-package-using-signtool) for detailed instruction.
