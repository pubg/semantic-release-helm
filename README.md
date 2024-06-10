# semantic-release-helm

[semantic-release](https://github.com/semantic-release/semantic-release) plugin to publish a helm chart to a helm repository and an OCI registry.

It updates [Helm](https://helm.sh/) chart `version` and `appVersion` in `Chart.yaml`.

It supports the following protocols:
- [OCI](https://helm.sh/docs/topics/registries/)
- [Chart Museum](https://chartmuseum.com/)

## Install

```
npm install -D @pubgcorp/semantic-release-helm
```

## Configuration

| Options                | Descriptions                                           | Required | type                            | Default  |
|------------------------|--------------------------------------------------------|----------|---------------------------------|----------|
| chartRepository        | URI for chart repository                               | yes*     | `string`                        | `none`   |
| ociRegistry            | URI for OCI registry                                   | yes*     | `string`                        | `none`   |
| chartDirectory         | Chart directory where `Chart.yml` is located           | no       | `string`                        | `.`      |
| versionUpdatePolicy    | Set update policy for `version` field of Chart.yaml    | no       | `"fixed" \| "sync" \| "desync"` | `"sync"` |
| appVersionUpdatePolicy | Set update policy for `appVersion` field of Chart.yaml | no       | `"fixed" \| "sync" \| "desync"` | `"sync"` |

\* At least one of ociRegistry or chartRepository is required.

Pass credentials through environment variable to login helm repository.

```
export HELM_REPOSITORY_USERNAME=<USERNAME>
export HELM_REPOSITORY_PASSWORD=<PASSWORD>
export HELM_REGISTRY_USERNAME=<USERNAME>
export HELM_REGISTRY_PASSWORD=<PASSWORD>
```

`HELM_REPOSITORY_USERNAME` and `HELM_REPOSITORY_PASSWORD` are used for chart repository login.

`HELM_REGISTRY_USERNAME` and `HELM_REGISTRY_PASSWORD` are used for OCI registry login.

If you are using oci registry and no credentials are provided, it will use the `HELM_REPOSITORY_USERNAME` and `HELM_REPOSITORY_PASSWORD` for login. 

### About versionUpdatePolicy & appVersionUpdatePolicy

Update policy

- **fixed**: Use Fixed version. The version will not be updated
- **sync**: Use `nextRelease.version`. New version will be set to `nextRelease.version`
- **desync**: Version will be increased according to `nextRelease.type` (one of _`major`_, _`premajor`_, _`minor`_, _`preminor`_, _`patch`_, _`prepatch`_, _`prerelease`_)

## Example

```json
{
  "plugins": [
    [
      "@pubgcorp/semantic-release-helm",
      {
        "chartRepository": "https://mychart.company.org/chartrepo/myproject",
        "ociRegistry": "mychart.company.org/myproject",
        "chartDirectory": "./chart",
        "versionUpdatePolicy": "sync",
        "appVersionUpdatePolicy": "fixed"
      }
    ]
  ]
}
```

- Your chart repository is `https://mychart.company.org/chartrepo/myproject` and OCI registry is `mychart.company.org/myproject`.
- `Chart.yaml` is in `chart` sub-directory
- `version` will follow next release version and `appVersion` will not modified

Old version

```yaml
# semantic-release version: 1.2.3
version: 1.2.3
appVersion: 2.3.1
```

New version - Case #1 patch

```yaml
# semantic-release version: 1.2.4
version: 1.2.4
appVersion: 2.3.1
```

New version - Case #2 minor

```yaml
# semantic-release version: 1.3.0
version: 1.3.0
appVersion: 2.3.1
```

New version - Case #3 major

```yaml
# semantic-release version: 2.0.0
version: 2.0.0
appVersion: 2.3.1
```

