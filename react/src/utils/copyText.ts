export default async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.permissions) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    if (document.queryCommandSupported('copy')) {
      const ele = document.createElement('textarea');
      ele.value = text;
      document.body.appendChild(ele);
      ele.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ele);

      if (!success) throw new Error('copy command was unsuccessful');
      return true;
    }

    throw new Error('unable to copy');
  } catch (e) {
    console.error(e);
    return false;
  }
}
