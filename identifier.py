from transformers import pipeline, AutoTokenizer

# Define the function
def identify_sensitive_entities(text):
    # Initialize the pipeline
    ner_pipeline = pipeline(
        "token-classification",
        model="bigcode/starpii",
        tokenizer=AutoTokenizer.from_pretrained(
            'bigcode/starpii',
            model_max_length=512
        )
    )

    # Get the results from the pipeline
    results = ner_pipeline(text)

    # Initialize an empty list to hold all entities
    entities = []

    # Initialize variables to hold the current entity's text and type
    current_entity_text = ""
    current_entity_type = ""
    current_entity_scores = []

    # Iterate over each token in the results
    for token in results:
        # If the token is the beginning of an entity
        if token['entity'].startswith('B'):
            # If there's a current entity being built, add it to the entities list
            if current_entity_text:
                average_score = sum(current_entity_scores) / len(current_entity_scores)
                if average_score > 0.9:
                    entities.append((current_entity_type, current_entity_text.strip()))
            # Start a new entity with the current token's word and type
            current_entity_text = token['word'].replace('Ġ', ' ')
            current_entity_type = token['entity'][2:]  # Get the entity type without the 'B-' prefix
            current_entity_scores = [token['score']]
        # If the token is inside an entity
        elif token['entity'].startswith('I') and current_entity_text:
            # Add the current token's word to the entity
            current_entity_text += token['word'].replace('Ġ', ' ')
            current_entity_scores.append(token['score'])
        # If the token is outside an entity
        else:
            # If there's a current entity being built, add it to the entities list
            if current_entity_text:
                average_score = sum(current_entity_scores) / len(current_entity_scores)
                if average_score > 0.9:
                    entities.append((current_entity_type, current_entity_text.strip()))
                current_entity_text = ""
                current_entity_type = ""
                current_entity_scores = []

    # Add the last entity to the list if it exists
    if current_entity_text:
        average_score = sum(current_entity_scores) / len(current_entity_scores)
        if average_score > 0.9:
            entities.append((current_entity_type, current_entity_text.strip()))

    # Return the list of entities
    return entities