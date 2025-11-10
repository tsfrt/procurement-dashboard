# Databricks notebook source
# MAGIC %md
# MAGIC # Procurement Contract Analysis
# MAGIC This notebook performs comprehensive analysis of procurement contracts

# COMMAND ----------

# MAGIC %md
# MAGIC ## Setup and Imports

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from datetime import datetime, timedelta
import json

# COMMAND ----------

# Get parameters
catalog = dbutils.widgets.get("catalog") if dbutils.widgets.get("catalog") else "main"
schema = dbutils.widgets.get("schema") if dbutils.widgets.get("schema") else "procurement_analytics"

print(f"Using catalog: {catalog}")
print(f"Using schema: {schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Create Schema if Not Exists

# COMMAND ----------

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {catalog}.{schema}")
spark.sql(f"USE {catalog}.{schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Sample Contract Data
# MAGIC In production, this would read from your data sources

# COMMAND ----------

# Sample contract data (in production, this would come from your data lake/warehouse)
contracts_data = [
    {
        "id": "CNT-001",
        "name": "Office Supplies Annual Contract",
        "vendor": "Global Office Solutions",
        "value": 500000,
        "spent": 425000,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "status": "active",
        "category": "Office Supplies",
        "department": "Operations"
    },
    {
        "id": "CNT-002",
        "name": "IT Infrastructure Services",
        "vendor": "TechCorp Systems",
        "value": 2500000,
        "spent": 1875000,
        "start_date": "2023-06-01",
        "end_date": "2025-05-31",
        "status": "active",
        "category": "IT Services",
        "department": "Technology"
    },
    {
        "id": "CNT-003",
        "name": "Facilities Management",
        "vendor": "BuildingCare Inc",
        "value": 1200000,
        "spent": 1150000,
        "start_date": "2023-01-01",
        "end_date": "2024-12-31",
        "status": "expiring-soon",
        "category": "Facilities",
        "department": "Operations"
    }
]

# COMMAND ----------

# Create DataFrame
contracts_schema = StructType([
    StructField("id", StringType(), False),
    StructField("name", StringType(), False),
    StructField("vendor", StringType(), False),
    StructField("value", LongType(), False),
    StructField("spent", LongType(), False),
    StructField("start_date", StringType(), False),
    StructField("end_date", StringType(), False),
    StructField("status", StringType(), False),
    StructField("category", StringType(), False),
    StructField("department", StringType(), False)
])

contracts_df = spark.createDataFrame(contracts_data, schema=contracts_schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Save Contracts to Delta Table

# COMMAND ----------

# Write to Delta table
contracts_df.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.contracts")

print(f"Saved {contracts_df.count()} contracts to {catalog}.{schema}.contracts")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Calculate Contract Health Metrics

# COMMAND ----------

# Calculate health metrics
contracts_health = contracts_df.withColumn(
    "spending_percentage",
    round((col("spent") / col("value")) * 100, 2)
).withColumn(
    "days_until_end",
    datediff(to_date(col("end_date")), current_date())
).withColumn(
    "health_status",
    when(col("spending_percentage") > 90, "critical")
    .when(col("spending_percentage") > 75, "warning")
    .otherwise("good")
).withColumn(
    "overall_score",
    when(col("spending_percentage") > 90, 60)
    .when(col("spending_percentage") > 75, 75)
    .otherwise(95)
).withColumn(
    "last_updated",
    current_timestamp()
)

# COMMAND ----------

# Save health metrics
contracts_health.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.contract_health")

print(f"Calculated health metrics for {contracts_health.count()} contracts")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Display Summary Statistics

# COMMAND ----------

display(contracts_health.select(
    "id",
    "name",
    "vendor",
    "value",
    "spent",
    "spending_percentage",
    "health_status",
    "overall_score"
))

# COMMAND ----------

# Summary by department
department_summary = contracts_health.groupBy("department").agg(
    count("id").alias("contract_count"),
    sum("value").alias("total_value"),
    sum("spent").alias("total_spent"),
    round(avg("spending_percentage"), 2).alias("avg_spending_pct")
)

display(department_summary)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Export Results

# COMMAND ----------

# Store analysis timestamp
dbutils.jobs.taskValues.set(key="analysis_timestamp", value=datetime.now().isoformat())
dbutils.jobs.taskValues.set(key="contracts_analyzed", value=contracts_df.count())
dbutils.jobs.taskValues.set(key="table_name", value=f"{catalog}.{schema}.contracts")

print("Contract analysis completed successfully!")

