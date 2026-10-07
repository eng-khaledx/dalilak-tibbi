/** Shared bootstrap for simple content pages. */
import { mountLayout } from '../components/layout.js';
import { bindLeadTriggers } from '../components/lead-modal.js';
import { initReveal } from '../components/ui.js';
import { setJsonLd, organizationJsonLd } from '../lib/seo.js';

mountLayout();
bindLeadTriggers();
initReveal();
setJsonLd('ld-org', organizationJsonLd());
