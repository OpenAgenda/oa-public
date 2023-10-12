from thumbor.loaders import http_loader

BUCKET = 'cibul'
REGION = 'eu-west-1'

# https://cibul.s3.eu-west-1.amazonaws.com/0000261cd25648a7815ac41d9cbb2767.thumb.image.jpg

async def load(context, url, *args, **kwargs):
  new_url = 'https://' + BUCKET + '.s3.' + REGION + '.amazonaws.com/' + url

  return await http_loader.load(context, new_url, *args, **kwargs)
