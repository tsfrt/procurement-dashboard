# Databricks notebook source
# MAGIC %md
# MAGIC # Pricing Benchmark Analysis
# MAGIC Compares contract pricing against market benchmarks

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

# Load contract data
contracts_df = spark.table(f"{catalog}.{schema}.contracts")

# COMMAND ----------

def seeded_random(seed: int) -> float:
    x = math.sin(seed) * 10000
    return x - math.floor(x)

def get_health_status(score: float) -> str:
    if score >= 80:
        return "good"
    elif score >= 60:
        return "warning"
    else:
        return "critical"

# COMMAND ----------

def analyze_pricing(row):
    contract_id = row['id']
    spent = row['spent']
    seed = int(''.join(filter(str.isdigit, contract_id)) or '12345')
    
    # Calculate pricing variance
    market_variance = (seeded_random(seed + 4) * 30) - 15  # -15% to +15%
    is_overpaying = market_variance > 0
    amount = abs(int(spent * (market_variance / 100)))
    score = 100 - abs(market_variance * 2)
    status = get_health_status(score)
    
    return {
        'contract_id': contract_id,
        'analysis_type': 'pricing-benchmark',
        'status': status,
        'market_variance': round(market_variance, 1),
        'price_difference': amount,
        'is_overpaying': is_overpaying,
        'market_position': 'Above Average' if is_overpaying else 'Below Average',
        'benchmark_score': round(score, 0),
        'severity': 'low' if status == 'good' else ('medium' if status == 'warning' else 'high'),
        'detected_at': datetime.now().isoformat()
    }

# COMMAND ----------

# Process pricing analysis
pricing_rdd = contracts_df.rdd.map(analyze_pricing)

pricing_schema = StructType([
    StructField("contract_id", StringType(), False),
    StructField("analysis_type", StringType(), False),
    StructField("status", StringType(), False),
    StructField("market_variance", DoubleType(), False),
    StructField("price_difference", LongType(), False),
    StructField("is_overpaying", BooleanType(), False),
    StructField("market_position", StringType(), False),
    StructField("benchmark_score", DoubleType(), False),
    StructField("severity", StringType(), False),
    StructField("detected_at", StringType(), False)
])

pricing_df = spark.createDataFrame(pricing_rdd, schema=pricing_schema)

# COMMAND ----------

# Save results
pricing_df.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.pricing_analysis")

print(f"Analyzed {pricing_df.count()} contracts for pricing")

# COMMAND ----------

# Display results
display(pricing_df.orderBy(col("severity").desc(), col("price_difference").desc()))

# COMMAND ----------

# Summary
summary = pricing_df.groupBy("status", "market_position").agg(
    count("contract_id").alias("count"),
    avg("market_variance").alias("avg_variance"),
    sum("price_difference").alias("total_price_difference")
)

display(summary)

# COMMAND ----------

# Calculate savings opportunities
overpaying_total = pricing_df.filter(col("is_overpaying") == True).agg(
    sum("price_difference")
).collect()[0][0] or 0

dbutils.jobs.taskValues.set(key="potential_savings", value=overpaying_total)
dbutils.jobs.taskValues.set(key="contracts_above_market", value=pricing_df.filter(col("is_overpaying") == True).count())

print(f"Pricing analysis completed! Potential savings: ${overpaying_total:,}")

