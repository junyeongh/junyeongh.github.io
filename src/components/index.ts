import "./layout/header";
import "./layout/footer";
import "./ui/button";
import "./ui/dropdown";

import { applyLanguage, getLanguage, localizeLinks, onLanguageChange } from "../lib/i18n";

const language = getLanguage();
applyLanguage(language);
localizeLinks(document, language);
onLanguageChange((next) => localizeLinks(document, next));
