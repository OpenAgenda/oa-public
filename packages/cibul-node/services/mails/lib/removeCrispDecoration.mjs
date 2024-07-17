export default function removeCrispDecoration(withCrispDecoration = '') {
  return withCrispDecoration
    .replace(/^Crisp\sEmail\n+/, '')
    .replace(/(\n|\s)+!\[\]\(https:\/\/openagenda.on.crisp.email(.|\n)+/, '');
}
