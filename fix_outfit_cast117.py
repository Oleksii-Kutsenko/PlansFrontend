import re
with open('plans-frontend/src/store/slices/clothing.ts', 'r') as f:
    content = f.read()

content = content.replace("state.outfit.push(action.payload);", "state.outfit.push(action.payload);\n        state.outfit = [...state.outfit];")

with open('plans-frontend/src/store/slices/clothing.ts', 'w') as f:
    f.write(content)
