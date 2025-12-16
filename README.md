          <TextField
            select
            label=""
            fullWidth
            margin="normal"
            value={editNotificationData.city}
            onChange={(e) =>
              setEditNotificationData((prev) => ({
                ...prev,
                city: e.target.value, // will send zone _id
                zone: "",
              }))
            }
            SelectProps={{ native: true }}
            sx={{ width: "48%", marginRight:"4%" }}
          >
            <option value="all">All Cities</option>
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.city}
              </option>
            ))}
          </TextField>

          <TextField
            select
            label=""
            fullWidth
            margin="normal"
            value={editNotificationData.zone}
            onChange={(e) =>
              setEditNotificationData((prev) => ({
                ...prev,
                zone: e.target.value,
              }))
            }
            SelectProps={{ native: true }}
            sx={{ width: "48%" }}
            disabled={!editNotificationData.city}
          >
            <option value="all">All Zones</option>

            {zones
              .find((c) => c._id === editNotificationData.city)
              ?.zones?.map((zn) => (
                <option key={zn._id} value={zn._id}>
                  {zn.zoneTitle}
                </option>
              ))}
          </TextField>