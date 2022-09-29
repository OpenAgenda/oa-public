function useSsr() {
  const isDOM = typeof window !== 'undefined' && window.document?.documentElement;

  return {
    isBrowser: isDOM,
    isServer: !isDOM,
  };
}

export default useSsr;
