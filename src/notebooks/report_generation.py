# Databricks notebook source
# MAGIC %md
# MAGIC # Procurement Analytics Report Generation
# MAGIC Consolidates all analysis results into comprehensive reports

# COMMAND ----------

from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from datetime import datetime

# COMMAND ----------

# Get parameters
catalog = dbutils.widgets.get("catalog") if dbutils.widgets.get("catalog") else "main"
schema = dbutils.widgets.get("schema") if dbutils.widgets.get("schema") else "procurement_analytics"

spark.sql(f"USE {catalog}.{schema}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Load All Analysis Results

# COMMAND ----------

contracts_df = spark.table(f"{catalog}.{schema}.contracts")
health_df = spark.table(f"{catalog}.{schema}.contract_health")
duplicates_df = spark.table(f"{catalog}.{schema}.duplicate_analysis")
compliance_df = spark.table(f"{catalog}.{schema}.compliance_analysis")
pricing_df = spark.table(f"{catalog}.{schema}.pricing_analysis")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Create Consolidated Analysis Table

# COMMAND ----------

# Union all analyses
all_analyses = duplicates_df.select(
    "contract_id",
    "analysis_type",
    "status",
    "severity",
    "detected_at"
).union(
    compliance_df.select(
        "contract_id",
        "analysis_type",
        "status",
        "severity",
        "detected_at"
    )
).union(
    pricing_df.select(
        "contract_id",
        "analysis_type",
        "status",
        "severity",
        "detected_at"
    )
)

# COMMAND ----------

# Join with contracts for complete view
consolidated_report = contracts_df.alias("c").join(
    all_analyses.alias("a"),
    col("c.id") == col("a.contract_id"),
    "left"
).select(
    "c.*",
    "a.analysis_type",
    "a.status",
    "a.severity",
    "a.detected_at"
)

# COMMAND ----------

# Save consolidated report
consolidated_report.write.format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .saveAsTable(f"{catalog}.{schema}.consolidated_analysis_report")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Generate Executive Summary

# COMMAND ----------

# Count by severity
severity_summary = all_analyses.groupBy("severity").agg(
    count("contract_id").alias("count")
).orderBy("severity")

# Count by status
status_summary = all_analyses.groupBy("status").agg(
    count("contract_id").alias("count")
).orderBy("status")

# Analysis type breakdown
analysis_summary = all_analyses.groupBy("analysis_type", "severity").agg(
    count("contract_id").alias("count")
).orderBy("analysis_type", "severity")

# COMMAND ----------

print("=" * 60)
print("PROCUREMENT ANALYTICS EXECUTIVE SUMMARY")
print("=" * 60)
print(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Total Contracts Analyzed: {contracts_df.count()}")
print(f"Total Analyses Performed: {all_analyses.count()}")
print()

# Display summaries
print("SEVERITY BREAKDOWN:")
severity_summary.show()

print("STATUS BREAKDOWN:")
status_summary.show()

print("ANALYSIS TYPE BREAKDOWN:")
analysis_summary.show()

# COMMAND ----------

# MAGIC %md
# MAGIC ## Top Issues Requiring Attention

# COMMAND ----------

# Get high severity issues
high_priority = consolidated_report.filter(
    col("severity") == "high"
).select(
    "id",
    "name",
    "vendor",
    "analysis_type",
    "status",
    "severity"
).distinct()

print(f"High Priority Issues: {high_priority.count()}")
display(high_priority)

# COMMAND ----------

# MAGIC %md
# MAGIC ## Save Summary Metrics

# COMMAND ----------

# Create summary metrics table
summary_data = [{
    'report_date': datetime.now().date().isoformat(),
    'total_contracts': contracts_df.count(),
    'total_analyses': all_analyses.count(),
    'high_severity_count': all_analyses.filter(col("severity") == "high").count(),
    'medium_severity_count': all_analyses.filter(col("severity") == "medium").count(),
    'low_severity_count': all_analyses.filter(col("severity") == "low").count(),
    'critical_status_count': all_analyses.filter(col("status") == "critical").count(),
    'warning_status_count': all_analyses.filter(col("status") == "warning").count(),
    'good_status_count': all_analyses.filter(col("status") == "good").count()
}]

summary_schema = StructType([
    StructField("report_date", StringType(), False),
    StructField("total_contracts", LongType(), False),
    StructField("total_analyses", LongType(), False),
    StructField("high_severity_count", LongType(), False),
    StructField("medium_severity_count", LongType(), False),
    StructField("low_severity_count", LongType(), False),
    StructField("critical_status_count", LongType(), False),
    StructField("warning_status_count", LongType(), False),
    StructField("good_status_count", LongType(), False)
])

summary_df = spark.createDataFrame(summary_data, schema=summary_schema)

# COMMAND ----------

# Append to summary history
summary_df.write.format("delta") \
    .mode("append") \
    .saveAsTable(f"{catalog}.{schema}.analysis_summary_history")

# COMMAND ----------

# Export final metrics
dbutils.jobs.taskValues.set(key="report_generated_at", value=datetime.now().isoformat())
dbutils.jobs.taskValues.set(key="high_priority_issues", value=high_priority.count())

print("=" * 60)
print("REPORT GENERATION COMPLETED SUCCESSFULLY!")
print("=" * 60)

