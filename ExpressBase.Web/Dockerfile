FROM microsoft/aspnetcore
ARG source
WORKDIR /app
EXPOSE 5000
COPY ${source:-obj/Docker/publish/ebweb} .
ENTRYPOINT ["dotnet", "ExpressBase.Web.dll"]