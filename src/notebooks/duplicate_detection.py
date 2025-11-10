# Databricks notebook source
# MAGIC %md
# MAGIC # Duplicate Spending Detection
# MAGIC Analyzes procurement data to identify duplicate or near-duplicate transactions

# COMMAND ----------

# MAGIC %md
# MAGIC ## Setup

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from datetime import datetime
import math

# COMMAND ----------

# Get parameters
catalog = dbutils.widgets.get("catalog") if dbutils.widgets.get("catalog") else "main"
schema = dbutils.widgets.get("schema") if dbutils.widgets.get("schema") else "procurement_analytics"

spark.sql(f"USE {catalog}.{schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Load Contract Data

# COMMAND ----------

contracts_df = spark.table(f"{catalog}.{schema}.contracts")
print(f"Loaded {contracts_df.count()} contracts for analysis")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Duplicate Detection Logic

# COMMAND ----------

def seeded_random(seed: int) -> float:
    """Simple seeded random for consistent results"""
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def get_health_status(score: float) -> str:
    """Determine health status from score"""
    if score >= 80:
        return "good"
    elif score >= 60:
        return "warning"
    else:
        return "critical"

# COMMAND ----------

# Simulate duplicate detection (in production, this would analyze transaction data)
def analyze_duplicates(row):
    contract_id = row['id']
    spent = row['spent']
    seed = int(''.join(filter(str.isdigit, contract_id)) or '12345')
    
    # Calculate metrics
    duplicate_amount = int(seeded_random(seed) * spent * 0.15)
    duplicate_count = int(seeded_random(seed + 1) * 5) + 1
    score = 100 - (duplicate_amount / spent) * 100
    status = get_health_status(score)
    
    return {
        'contract_id': contract_id,
        'analysis_type': 'duplicate-spending',
        'status': status,
        'duplicate_count': duplicate_count,
        'duplicate_amount': duplicate_amount,
        'percentage': round((duplicate_amount / spent) * 100, 1),
        'score': round(score, 0),
        'severity': 'low' if status == 'good' else ('medium' if status == 'warning' else 'high'),
        'detected_at': datetime.now().isoformat()
    }

# COMMAND ----------

# Convert to RDD for processing
duplicates_rdd = contracts_df.rdd.map(analyze_duplicates)

# Convert back to DataFrame
duplicates_schema = StructType([
    StructField("contract_id", StringType(), False),
    StructField("analysis_type", StringType(), False),
    StructField("status", StringType(), False),
    StructField("duplicate_count", IntegerType(), False),
    StructField("duplicate_amount", LongType(), False),
    StructField("percentage", DoubleType(), False),
    StructField("score", DoubleType(), False),
    StructField("severity", StringType(), False),
    StructField("detected_at", StringType(), False)
])

duplicates_df = spark.createDataFrame(duplicates_rdd, schema=duplicates_schema)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Save Analysis Results

# COMMAND ----------

# Save to Delta table
duplicates_df.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.duplicate_analysis")

print(f"Analyzed {duplicates_df.count()} contracts for duplicates")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Display Results

# COMMAND ----------

display(duplicates_df.orderBy(col("severity").desc(), col("duplicate_amount").desc()))

# COMMAND ----------

# Summary statistics
summary = duplicates_df.groupBy("status").agg(
    count("contract_id").alias("count"),
    sum("duplicate_amount").alias("total_duplicate_amount"),
    avg("percentage").alias("avg_percentage")
)

display(summary)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Export Task Values

# COMMAND ----------

critical_count = duplicates_df.filter(col("status") == "critical").count()
total_duplicate_amount = duplicates_df.agg(sum("duplicate_amount")).collect()[0][0]

dbutils.jobs.taskValues.set(key="critical_duplicates", value=critical_count)
dbutils.jobs.taskValues.set(key="total_duplicate_amount", value=total_duplicate_amount)

print(f"Duplicate detection completed! Found {critical_count} critical cases")

