from thumbor.loaders import http_loader

REGION = 'eu-west-1'

async def load(context, url, *args, **kwargs):
  bucket, path = _get_bucket_and_path(url)
  new_url = 'https://' + bucket + '.s3.' + REGION + '.amazonaws.com/' + path

  return await http_loader.load(context, new_url, *args, **kwargs)

def _get_bucket_and_path(url):
    segments = url.split('/')
    bucket = segments[0]
    path = '/'.join(segments[1:])
    return bucket, path
