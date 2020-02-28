---
title: Lessons from confusing between Microsoft Account(MSA) and Office 365 account
author: MoonCha
layout: post
categories: [UWP, MICROSOFT, DEVELOPMENT]
---

### Two Different Types of Microsoft Accounts

Microsoft has two different account types. Microsoft Account(MSA) and Office 365 account.

[this article](https://tellus-consulting.com/microsoft-account-msa-compared-to-office-365-account/) explains differences between Microsoft Accounts(MSAs) and Office 365 accounts well.

In short, there exist two different types of Microsoft accounts: MSA and Office 365, and each account has access to some unique services.

![Login Page of Microsoft]({{ 'assets/images/microsoft-login-with-different-account-types.png' | relative_url }} "Login Page of Microsoft")

We can login with different type of accounts as shwon in the picture above. One with name tag is Office 365 account, and the other one is MSA.

However, I didn't know that each account type has own access to different services when I was working on Windows Store payments. To implement payments functionality, I should handle stuffs related to **Partner Center**(for app submission) and **Azure AD**(for validating purchase for `Windows.Services.Store` namespace payments). After I worked on implementing payments functionality, I could draw a brief diagram for Microsoft accounts like:

```mermaid
graph TD
subgraph MSA
  OneDriveP[OneDrive Personal]
  Outlook[Outlook Email]
  PartnerCenter[Partner Center]
end
subgraph Office365
  OneDriveB[OneDrive Business]
  AzureAD[Azure AD]
  PartnerCenterManager[Partner Center Manager]
end
PartnerCenter-->|grant access|PartnerCenterManager
```

Followings are little lessons I learned while working:

### (1) MSA can't use Azure AD

You can't manage Azuare AD settings if your account is MSA.

For example, you will see pages with error messages like below if you go to Azure portal with MSA:

![Azure AD Error Message (1)]({{ 'assets/images/azure-ad-error-message-1-when-account-is-msa.png' | relative_url }} "Azure AD Error Message (1)")
![Azure AD Error Message (2)]({{ 'assets/images/azure-ad-error-message-2-when-account-is-msa.png' | relative_url }} "Azure AD Error Message (2)")
![Azure AD Error Message (3)]({{ 'assets/images/azure-ad-error-message-3-when-account-is-msa.png' | relative_url }} "Azure AD Error Message (3)")

However, the error messages are not descriptive enough. They just show messages like:

- Unable to complete due to service connection error, please try again later.
- Unable to get the list of domains. Please try again later.
- Unable to complete due to service connection error, please try again later.

not something like "Permission Denied". Even the messages seems to indicate as if it is a temporary problem.

Fortunately, I also found an error message showing the adequate reason why I can't use Azure AD:

> Access denied
>
> You do not have access
>
> Looks like you don't have access to this content. To get access, please contact the owner.

![Azure AD Error Message (4)]({{ 'assets/images/azure-ad-error-message-4-when-account-is-msa.png' | relative_url }} "Azure AD Error Message (4)")

Thanks to the message, finally I could find out that MSA account can't use Azure AD.

### (2) Office 365 Account can't manage Microsoft Store App at Partner Center by itself

MSA can't use Azure AD, but MSA can submit app to Windows Store using Partner Center.

On the contrary, Office 365 account can't submit app to Windows Store using Partner Center by itself.

If you click *Get started* at *Developer programs > Windows*,

![Developer programs > Windows]({{ 'assets/images/developer-program-windows-product.png' | relative_url }} "Developer programs > Windows")

you will see error messages like this:

![Partner Center Error for Office 365 Account]({{ 'assets/images/partner-center-error-for-office-365-account.png' | relative_url }} "Partner Center Error for Office 365 Account")

We should notice the first line of the error messages:

- **Sign in with an Azure AD user account that is already associated with a Partner Center account**
- Sign in with a Microsoft account that is already associated with a Partner Center account
- Sign in with a Microsoft account that you'd like to register for a new Partner Center account

Inferencing from the first error message, we can expect that the way to associate Azure AD account with Partner Center exists.

It's true, see following:

### (3) Office 365 Account get control to Partner Center by MSA account

MSA can allow Office 365 account to manage Partner Center by placing an Office 365 account as manager.

You can follow [this document](https://docs.microsoft.com/en-us/windows/uwp/publish/associate-azure-ad-with-partner-center) to achieve this.

If you complete granting access to Office 365 account, you will see page like this:

![Partner Center Tenants Setting Result]({{ 'assets/images/after-enroll-azure-ad-tenant.png' | relative_url }} "Partner Center Tenants Setting Result")

By doing this, you can use Office 365 account instead to manage Partner Center page.
