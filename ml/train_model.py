"""
Student Placement Prediction Model
RandomForestClassifier for placement prediction
"""

import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load dataset
print("Loading dataset...")
data = pd.read_csv('student_data.csv')

# Features and target
features = ['cgpa', 'tenth', 'twelfth', 'coding', 'projects', 'internships', 'communication']
X = data[features]
y = data['placed']

print(f"Dataset shape: {X.shape}")
print(f"Target distribution:\n{y.value_counts()}\n")

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training set: {len(X_train)}, Test set: {len(X_test)}")

# Train model
print("\nTraining RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Training accuracy: {train_score:.4f}")
print(f"Testing accuracy: {test_score:.4f}")

# Feature importance
print("\nFeature Importance:")
for feature, importance in sorted(zip(features, model.feature_importances_), key=lambda x: x[1], reverse=True):
    print(f"  {feature}: {importance:.4f}")

# Save model
print("\nSaving model as model.pkl...")
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("✓ Model saved successfully!")
