# Itch.io Plugin

## Overview

The **Itch.io** plugin provides integration with the Itch.io API, allowing you to authenticate, fetch user data, and query game ownership. It is a non‑world object that exposes a set of conditions, actions, and expressions for use in Construct 2 event sheets.

## Settings (from `edittime.js`)

```js
{\n  "name": "Itch.io",
  "id": "ItchIO",
  "version": "1.0",
  "description": "Integrate with Itch.io API. Supports secure environment variable authentication.",
  "author": "Scirra/Antigravity",
  "help url": "https://itch.io/docs/api",
  "category": "Web",
  "type": "object",
  "rotatable": false,
  "flags": pf_singleglobal
}
```

## Conditions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | On login success | Authentication | Triggered when authentication is successful. |
| 1 | On login error | Authentication | Triggered when authentication fails. |
| 2 | Is logged in | Authentication | True if a valid API key is present. |
| 5 | On my games received | Data | Triggered when the list of games is received. |
| 6 | On purchase check complete | Data | Triggered after checking ownership status. |
| 7 | Is owned | Data | True if the last purchase check returned a valid purchase. |

## Actions

| ID | Name | Category | Description |
|----|------|----------|-------------|
| 0 | Attempt Login | Authentication | Try to find the API Key from the environment (Secure) or properties. |
| 1 | Set API Key | Authentication | Manually set the API Key. |
| 2 | Request User Profile | Data | Fetch the current user's profile information. |
| 3 | Generic Request | Data | Make a generic authenticated GET request. |
| 4 | Request My Games | Data | Fetch the list of games you have uploaded or have access to. |
| 5 | Check Ownership | Data | Check if the current user owns the specified game ID. |

## Expressions

| ID | Expression | Category | Return Type | Description |
|----|------------|----------|-------------|-------------|
| 0 | Get Current API Key | Authentication | string | Get the currently used API Key (use with caution). |
| 1 | Get Username | User | string | Get the username from the profile. |
| 2 | Get User ID | User | number | Get the user ID from the profile. |
| 3 | Get Profile URL | User | string | Get the profile URL. |
| 4 | Get Last Error | General | string | Get the last error message. |
| 5 | Get Last Data | General | string | Get the last raw JSON response. |
| 6 | Get Game Count | My Games | number | Get the number of games retrieved. |
| 7 | Get Game Title | My Games | string | Get the title of a game at index (0‑based). |
| 8 | Get Game ID | My Games | number | Get the ID of a game at index (0‑based). |
| 9 | Is Owned Value | Data | number | Returns 1 if owned, 0 if not (based on last check). |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| API Key Source | combo | Environment Variable | Where to look for the API Key. 'Environment Variable' is secure for Itch app. 'Manual' is insecure. |
| Manual API Key | text | (empty) | Enter API Key here ONLY if using 'Manual' source. WARNING: This is visible in the source! |

## Usage

Add the plugin to your project, then use the actions and conditions to authenticate and query Itch.io data.
