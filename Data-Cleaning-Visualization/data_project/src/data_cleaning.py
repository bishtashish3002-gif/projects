
def clean_data(df):
      df["Age"] = df["Age"].fillna(df["Age"].mean())
      df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode()[0])
      df.drop(columns=["Cabin"], inplace=True)
      df.drop_duplicates(inplace=True)
      return df