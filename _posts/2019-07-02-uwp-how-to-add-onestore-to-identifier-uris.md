---
title: How to add onestore.microsoft.com to Azure AD app manifest identifierUris
author: MoonCall
layout: post
categories: [NOTE_IT, NOTE_DEV]
---

I found many people having difficulty in following **[Manage product entitlements from a service](https://docs.microsoft.com/en-us/windows/uwp/monetize/view-and-grant-products-from-a-service)** document's Step 1. 5th instruction to implement uwp payments with `Windows.Services.Store` namespace, and I was also one of those suffering people.

> Add several required audience URIs to your *application manifest*. In the left pane, click **Manifest**. Click **Edit**, replace the "identifierUris" section with the following text, and then click **Save**.
>
> ```JSON
> "identifierUris" : [
>        "https://onestore.microsoft.com",
>        "https://onestore.microsoft.com/b2b/keys/create/collections",
>        "https://onestore.microsoft.com/b2b/keys/create/purchase"
>    ],
>```

### Problem

The problem is that every time I replace manifest's `identifierUris` with the value above, we get an error like:

> Failed to update WindowsTestApp application. Error detail: The Application ID URI must be from a verified domain within your organisation's directory.

The error instructs me to add `onestore.microsoft.com` to our verified domain, but adding `onestore.microsoft.com` is obviously impossible as I don't own the domain.

I found other people submitted the same issues like:

- https://github.com/MicrosoftDocs/windows-uwp/issues/1717

- https://social.msdn.microsoft.com/Forums/en-US/ab849235-e9a0-4676-b810-f58e35248a1f/can-not-save-application-manifest-when-adding-httpsonestoremicrosoftcom-to-identifieruris?forum=windowsstore

I read replies in the links and searched more but I couldn't find any working solution.

~~Yes, I know the domain should be inside verified domain, but what's the point is that I cannot!! Stop saying to check domain.~~

### Solution

After wasting a lot of time, I found a working but strange solution.

The solution is to **modify manifest using `App registrations (Legacy)` tab**

![App Registrations (Legacy) Tab Image]({{ 'assets/images/app-registrations-tab.png' | relative_url }} "App Registrations (Legacy) Tab")

If you go to `App registrations (Legacy)` tab, you will see a warning message like:

> App registrations (Legacy) will be replaced and no longer available starting May 2019. Go to the new and improved App registrations (now Generally Available).

If you modify `identifierUris` to the value above, you will see an error message like:

> Failed to save manifest. Error details: Request_BadRequest

**NOTE:** It was 2 July 2019, but I could use the `App registrations (Legacy)` tab to create or modify app registrations.

I don't have no idea why I had to use the already deprecated legacy, but it successfully modified `identifierUris` to the values involving `https://onestore.microsoft.com/b2b/keys/create/collections` eventhough it showed `Request_BadRequest` error message.

As I had no way to put **https://onestore.microsoft.com/b2b/keys/create/collections** to `identifierUris`, I couldn't get Azure AD access token for **https://onestore.microsoft.com/b2b/keys/create/collections** audience URI. It just showed an error message like:

> AADSTS500011: The resource principal named https://onestore.microsoft.com/b2b/keys/create/collections was not found in the tenant named (...). This can happen if the application has not been installed by the administrator of the tenant or consented to by any user in the tenant. You might have sent your authentication request to the wrong tenant.

However, I could get access token for the audience URI after I use the solution above.

---

### Another Solution

https://github.com/MicrosoftDocs/windows-uwp/issues/1717#issuecomment-507577676 suggests another way to solve this problem.

> I have solve this problem:
> Changing following fields to following value in your manifest.
>
> ```JSON
> "accessTokenAcceptedVersion": 1,
> "identifierUris": [
>     "https://onestore.microsoft.com",
>     "https://onestore.microsoft.com/b2b/keys/create/collections",
>     "https://onestore.microsoft.com/b2b/keys/create/purchase"
>     ],
> "signInAudience": "AzureADMyOrg",
> ```
>
> The "signInAudience" part can solve this problem, and the "accessTokenAcceptedVersion" part can solve the "getCustomerCollectionsIdAsync" return empty problem.
> https://stackoverflow.com/a/56848128/1586797

I've not tested the solution above, but there exists another important point to notice.

After I solved `identifierUris` problem, I also met `"getCustomerCollectionsIdAsync" return empty` problem.

I did not have no idea to solve, but changing `accessTokenAcceptedVersion` to 1 resolved the `return empty` problem. (previously `null`).

Many people seems to suffer from the same problems, but why don't Microsoft update documents handling those stuffs?

I thought Microsoft is one of the best companies that manage documents well, so it is quite disappointing...
