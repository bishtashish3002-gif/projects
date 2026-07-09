import os
import matplotlib.pyplot as plt
import seaborn as sns

# Better-looking graphs
sns.set_theme(style="whitegrid")

# Create images folder if it doesn't exist
os.makedirs("images", exist_ok=True)

def plot_age_distribution(df):
      plt.figure(figsize=(8, 5))
      sns.histplot(df["Age"], bins=30, kde=True)
      plt.title("Age Distribution")
      plt.xlabel("Age")
      plt.ylabel("Number of Passengers")
      plt.savefig("images/age_distribution.png")
      plt.show()
      plt.close()

def plot_survival_by_gender(df):
      plt.figure(figsize=(7, 5))
      sns.countplot(data=df, x="Sex", hue="Survived")
      plt.title("Survival by Gender")
      plt.xlabel("Gender")
      plt.ylabel("Count")
      plt.savefig("images/survival_by_gender.png")
      plt.show()
      plt.close()

def plot_passenger_class(df):
      plt.figure(figsize=(6, 6))
      df["Pclass"].value_counts().plot(
            kind="pie",
            autopct="%1.1f%%",
            startangle=90
      )
      plt.title("Passenger Class Distribution")
      plt.ylabel("")
      plt.savefig("images/passenger_class_distribution.png")
      plt.show()
      plt.close()

def plot_fare_boxplot(df):
      plt.figure(figsize=(8, 5))
      sns.boxplot(x=df["Fare"])
      plt.title("Fare Distribution")
      plt.savefig("images/fare_boxplot.png")
      plt.show()
      plt.close()

def plot_age_vs_fare(df):
      plt.figure(figsize=(8, 5))
      sns.scatterplot(
            data=df,
            x="Age",
            y="Fare",
            alpha=0.7
      )
      plt.title("Age vs Fare")
      plt.xlabel("Age")
      plt.ylabel("Fare")
      plt.savefig("images/age_vs_fare.png")
      plt.show()
      plt.close()

def plot_heatmap(df):
      plt.figure(figsize=(10, 6))
      sns.heatmap(
            df.corr(numeric_only=True),
            annot=True,
            cmap="coolwarm"
      )
      plt.title("Correlation Heatmap")
      plt.savefig("images/correlation_heatmap.png")
      plt.show()
      plt.close()

def create_all_visualizations(df):
      #Generate all visualizations.
      plot_age_distribution(df)
      plot_survival_by_gender(df)
      plot_passenger_class(df)
      plot_fare_boxplot(df)
      plot_age_vs_fare(df)
      plot_heatmap(df)