import { MenuItem } from '@openagenda/uikit/snippets';

import { Link } from '@openagenda/uikit';

export default function LinkMenuItem({ value, href, children }) {
  return (
    <MenuItem value={value} asChild fontWeight="bold" height="50px">
      <Link unstyled href={href}>
        {children}
      </Link>
    </MenuItem>
  );
}
