import json
from fastapi import FastAPI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
import re
from sklearn.base import BaseEstimator, TransformerMixin
import spacy

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

def separate_punc(doc):
    no_punc = [token.text for token in nlp(doc) if not token.is_stop]
    no_punc_str = " ".join(no_punc)
    return [token.text.lower() for token in nlp(no_punc_str) if token.text not in '\n\n \n\n\n!"-#$%&()--.*+,-/:;<=>?@[\\]^_`{|}~\t\n ']

class SpacyPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.punc = '\n\n \n\n\n!"-#$%&()--.*+,-/:;<=>?@[\\]^_`{|}~\t\n '

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        processed_docs = []
        for doc in X:
            tokens = [token.text for token in nlp(doc) if not token.is_stop]
            no_punc_str = " ".join(tokens)
            tokens_cleaned = [
                token.text.lower() for token in nlp(no_punc_str)
                if token.text not in self.punc
            ]
            processed_docs.append(" ".join(tokens_cleaned))
        return processed_docs
    
pipeline = Pipeline(
    [
        ("preprocess",SpacyPreprocessor()),
        ("vectorizer",TfidfVectorizer())
    ]
)
