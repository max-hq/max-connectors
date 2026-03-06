# Max Connectors

Connector collection for [Max](https://github.com/max-hq/max). Each `connector-*` directory is a self-contained connector package.

## Install as a collection

```bash
max install --collection git@github.com:max-hq/max-connectors.git
```

This clones the repository to `~/.max/collections/max-connectors/` and makes all connectors available to Max.

## Local development

If you're developing connectors against a local checkout of Max, link the core packages first:

```bash
# 1. Register the Max packages (from the Max repo)
cd /path/to/max/packages/core && bun link
cd /path/to/max/packages/connector && bun link

# 2. Install dependencies (from this repo)
cd /path/to/max-connectors
bun install
```

`bun link` creates global symlinks so that `@max/core` and `@max/connector` resolve to your local Max source. The connector `package.json` files use `link:@max/core` and `link:@max/connector` to pick these up.

## Adding a new connector

1. Create a `connector-<name>/` directory with a `package.json` and `src/index.ts`
2. Export a default `ConnectorModule` from `src/index.ts`
3. Add `@max/core` and `@max/connector` as dependencies (use `link:` for local dev)
