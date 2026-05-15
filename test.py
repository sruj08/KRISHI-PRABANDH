import re
text='\u0935\u093f\u092d\u093e\u0917\u093e\u0905 \u0902\u0924\u0930\u094d\u0917\u0924'
fixed=re.sub(r'([\u0900-\u097F])\s+([\u0901-\u0903\u093E-\u094D])', r'\1\2', text)
print([hex(ord(c)) for c in fixed])
