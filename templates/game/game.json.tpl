{
  "id": "{{ID}}",
  "name": {{TITLE_JSON}},
  "description": "Course déterministe : retirer une ou deux pierres, prendre la dernière pour gagner.",
  "players": { "min": 2, "max": 2 },
  "type": "turn-based",
  "tags": ["strategie", "pedagogie"],
  "version": "1.0.0",
  "controls": "keyboard",
  "orientation": "any",
  "bots": {
    "default": "Prudent",
    "available": [{ "name": "Prudent", "file": "bots/prudent.js", "difficulty": "easy" }]
  }
}
