import { frontmatter } from 'eslint-plugin-frontmatter2';
import { browser } from '@shgysk8zer0/eslint-config';

export default browser({
	 plugins: { frontmatter2: frontmatter },
	processor: 'frontmatter2/frontmatter',
});
