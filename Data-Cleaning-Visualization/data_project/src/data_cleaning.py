import pandas as pd

def clean_data(df):
      df["Age"] = df["Age"].fillna(df["Age"].mean())
      df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode()[0])
      df.drop(columns=["Cabin"], inplace=True)
      df.drop_duplicates(inplace=True)
      return df

def remove_duplicates(df):
      before = len(df)
      df.drop_duplicates(inplace=True)
      after = len(df)
      print(f"Removed {before - after} duplicates")
      return df

def remove_outliers(df, column):
      Q1 = df[column].quantile(0.25)
      Q3 = df[column].quantile(0.75)
      IQR = Q3 - Q1
      lower_bound = Q1 - 1.5 * IQR
      upper_bound = Q3 + 1.5 * IQR
      return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

def fix_data_types(df):
      df["PassengerId"] = df["PassengerId"].astype(int)
      df["Survived"] = df["Survived"].astype(int)
      df["Pclass"] = df["Pclass"].astype(int)
      df["Age"] = df["Age"].astype(float)
      df["Fare"] = df["Fare"].astype(float)
      return df