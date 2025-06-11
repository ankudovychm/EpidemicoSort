import pandas as pd
import csv
# Constants
prefix = 'docs/data'
data_input_csv = prefix + '/medicine_dataset.csv'
sideaffects_dict = {}


# Read into DF
meds_df = pd.read_csv(data_input_csv, quotechar='"', skipinitialspace=True)

# Remove all commas from string fields in the DataFrame
meds_df = meds_df.applymap(lambda x: x.replace(',', '') if isinstance(x, str) else x)

# Column List in Order
cols = list(meds_df.columns)

# For each medicine
for entry in meds_df.values:

    # for each data point in a particular medicine
    for value in range(len(entry)):

        # Keeps track of name
        if cols[value] == 'name':
            name = entry[value]

        # If it one of the (30) sideeffets column and is not empty
        elif cols[value].startswith('sideEffect') and type(entry[value]) != float:

            # Try adding 1 for the occurance to the occurance dict, if it does not exist for a certain side effect, start the count
            try:
                _ = (sideaffects_dict[entry[value]])
            except KeyError:
                sideaffects_dict[entry[value]] = 1

            else:
                sideaffects_dict[entry[value]] += 1

# Turn dictionary into a DataFrame
df_side_affects = pd.DataFrame(sideaffects_dict.items(), columns=["Side Effect", "Frequency"])

# Create 10-rank scale: rank 10 = most frequent
df_side_affects["Rank"] = pd.qcut(df_side_affects["Frequency"], 10, labels=False) + 1
#df_side_affects["Rank"] = 11 - df_side_affects["Rank"]  # Flip so highest frequency = rank 10

# Sort by Rank descending
df = df_side_affects.sort_values(by="Rank", ascending=False)

# Write to CSV
output_file = prefix + "/side_effect_counts.csv"
with open(output_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Side Effect", "Raw Frequency", "Freq. Rank"])
    for _, row in df.iterrows():
        writer.writerow([row["Rank"],row["Side Effect"], row["Frequency"]])










