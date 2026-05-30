// `microsandbox` backend — the HOSTED, multi-tenant hard boundary.
//
// NOT IMPLEMENTED IN THIS POC. It is a stub on purpose: microsandbox needs
// hardware virtualization (Linux+KVM or macOS Apple Silicon) which is a host
// concern, out of scope for a read-only local proof of concept. The stub exists
// to prove the interface ACCOMMODATES it with no change to the rest of the
// server — and to document exactly where each guardrail plugs in.
//
// Real implementation sketch (see README → "Hébergé / multi-tenant"):
//
//   import { Sandbox } from 'microsandbox';
//   const sb = await Sandbox.builder()
//     .image('denoland/deno:alpine')          // OCI image carrying the runtime + SDK
//     .memory(limits.memoryMb)                // hard RAM cap (cgroup inside the µVM)
//     .timeout(limits.timeoutMs)              // hard wall-clock
//     .network({ allow: allowNet })           // egress allowlist — MUST also block
//                                             //   169.254.169.254, RFC1918, localhost
//     .create();                              // boots an EPHEMERAL µVM (one per call)
//   try {
//     const r = await sb.run('deno', buildDenoArgs(allowNet, limits), { stdin: code });
//     return { stdout: r.stdout, stderr: r.stderr, timedOut: r.timedOut, exitCode: r.exitCode };
//   } finally {
//     await sb.destroy();                     // never reuse a µVM across callers
//   }
//
// Even with microsandbox, the policy layer is still ours to set: egress
// allowlist + metadata/RFC1918 block, scoped (caller) token with NO ambient
// credentials, rate-limit + concurrency cap, and an audit log. The µVM is the
// isolation; it is not the whole policy.

/** @returns {import('./executor.js').SandboxExecutor} */
export function createMicrosandboxExecutor() {
  return {
    name: 'microsandbox',
    run: async () => {
      throw new Error(
        'microsandbox backend is not implemented in this POC. It is the hosted, '
          + 'multi-tenant boundary and requires a KVM/Apple-Silicon host. See '
          + 'src/sandbox/microsandboxExecutor.js for the implementation sketch and '
          + 'README → "Hébergé / multi-tenant" for the mandatory precautions.',
      );
    },
  };
}
