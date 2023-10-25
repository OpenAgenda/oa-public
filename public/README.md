# OpenAgenda monorepo - public part

Welcome to the `public` subtree of the `oa` repo.

## Important Notice for Contributors

Due to the specific workings of Yarn v4, if you wish to contribute to this sub-project, please carefully follow the steps below before any operation:

1. **Before you begin**:  
    Use the command:
    ```bash
    mv yarn.lock-workspace yarn.lock
    ```
2. Make your changes and operations as usual.
3. **Before committing**:  
   Use the command:
    ```bash
    mv yarn.lock yarn.lock-workspace
    ```

This ensures proper dependency management and prevents potential conflicts.

Thank you for your contribution!
