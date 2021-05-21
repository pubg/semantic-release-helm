# semantic-release-helm

Helm plugin for [semantic-release](https://github.com/semantic-release/semantic-release)

It updates [Helm](https://helm.sh/) chart's `version` and `appVersion` in `Chart.yaml`

## Install

```
npm install -D @pubgcorp/semantic-release-helm
```

## Configuration

| Options                | Descriptions                                                          | Required | type                            | Default  |
| ---------------------- | --------------------------------------------------------------------- | -------- | ------------------------------- | -------- |
| repository             | URI for chart repository                                              | yes      | `string`                        | `none`   |
| chartDirectory         | Chart directory where `Chart.yml` is located                          | no       | `string`                        | `.`      |
| useOCIFeature          | Enable `HELM_EXPERIMENTAL_OCI` feature and use OCI supported registry | no       | `boolean`                       | `false`  |
| versionUpdatePolicy    | Set update policy for `version` field of Chart.yaml                   | no       | `"fixed" \| "sync" \| "desync"` | `"sync"` |
| appVersionUpdatePolicy | Set update policy for `appVersion` field of Chart.yaml                | no       | `"fixed" \| "sync" \| "desync"` | `"sync"` |


Pass credentials through environment variable to login helm repository.

```
export HELM_REPOSITORY_USERNAME=<USERNAME>
export HELM_REPOSITORY_PASSWORD=<PASSWORD>
```

### About versionUpdatePolicy & appVersionUpdatePolicy

Update policy

- **fixed**: Use Fixed version. The version will not be updated
- **sync**: Use `nextRelease.version`. New version will be set to `nextRelease.version`
- **desync**: Version will be increased according to `nextRelease.type` (one of *`major`*, *`premajor`*, *`minor`*, *`preminor`*, *`patch`*, *`prepatch`*, *`prerelease`*)

## Example

```json
{
  "plugins": [
    [
      "@pubgcorp/semantic-release-helm",
      {
        "repository": "https://mychart.company.org/chartrepo/myproject",
        "chartDirectory": "./chart",
        "versionUpdatePolicy": "sync",
        "appVersionUpdatePolicy": "static"
      }
    ]
  ]
}
```

- Your chart repository is `https://mychart.company.org/chartrepo/myproject` and `Chart.yaml` is in `chart` sub-directory
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