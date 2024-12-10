from thumbor.loaders import http_loader, LoaderResult

providers_config = {
  "main": "https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/{path}",
  "dev": "https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/dev/{path}",
  "osm": ("map", "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
  "cibul": "https://cibul.s3.eu-west-1.amazonaws.com/{path}",
  "cibuldev": "https://cibuldev.s3.eu-west-1.amazonaws.com/{path}"
}

async def load(context, url, *args, **kwargs):
  segments = url.split('/')
  first_segment = segments[0]

  provider = providers_config.get(first_segment)
  if not provider:
    return LoaderResult(successful=False, error=LoaderResult.ERROR_BAD_REQUEST)

  if isinstance(provider, str):
    return await load_default_provider(context, provider, segments, *args, **kwargs)
  elif isinstance(provider, tuple) and provider[0] == "map":
    return await load_map_provider(context, provider[1], segments, *args, **kwargs)
  else:
    return LoaderResult(successful=False, error=LoaderResult.ERROR_BAD_REQUEST)

async def load_default_provider(context, url_template, segments, *args, **kwargs):
  path = '/'.join(segments[1:])
  new_url = url_template.format(path=path)
  return await http_loader.load(context, new_url, *args, **kwargs)

async def load_map_provider(context, url_template, segments, *args, **kwargs):
  if len(segments) == 5:
    s, z, x, y = segments[1:5]
  elif len(segments) == 4:
    z, x, y = segments[1:4]
  else:
    return LoaderResult(successful=False, error=LoaderResult.ERROR_BAD_REQUEST)

  new_url = url_template.format(s=s, z=z, x=x, y=y)
  return await http_loader.load(context, new_url, *args, **kwargs)
