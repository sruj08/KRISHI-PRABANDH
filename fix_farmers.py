import re

with open('frontend/src/mock/officer-operations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to fix the generated farmers in FARMER_REGISTRY.
# We generated: totalLandHa -> landHa
# kycStatus -> verification
# scheme: 'PMFBY' -> schemes: 'PMFBY'
# Also add risk: 'low', lastActivity: '2026-05-15'

content = content.replace("totalLandHa:", "landHa:")
content = content.replace("kycStatus:", "verification:")
content = content.replace("scheme: 'PMFBY'", "schemes: 'PMFBY',\n    risk: 'low',\n    lastActivity: '2026-05-15'")

with open('frontend/src/mock/officer-operations.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed farmers in officer-operations.js")
