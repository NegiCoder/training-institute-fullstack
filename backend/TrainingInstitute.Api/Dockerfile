# Stage 1: build and publish the ASP.NET Core app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file first so Docker can cache NuGet restore
COPY TrainingInstitute.Api.csproj ./
RUN dotnet restore TrainingInstitute.Api.csproj

# Copy the rest of the backend source
COPY . ./

# Publish creates a self-contained folder ready for runtime image
RUN dotnet publish TrainingInstitute.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

# Stage 2: runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Container Apps provides a PORT env var, but ASP.NET listens to ASPNETCORE_URLS.
# We use 8080 because Azure Container Apps commonly exposes container port 8080.
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish ./
RUN mkdir -p /app/wwwroot/certificates

EXPOSE 8080

ENTRYPOINT ["dotnet", "TrainingInstitute.Api.dll"]