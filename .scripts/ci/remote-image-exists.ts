import execa from 'execa';

export async function remoteImageExists(
  repository: string,
  image: string,
  tag: string,
) {
  return execa('docker', [
    'manifest',
    'inspect',
    `${repository}/${image}:${tag}`,
  ])
    .then(() => true)
    .catch(() => false);
}
