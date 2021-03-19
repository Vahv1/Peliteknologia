using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.Experimental.XR;
using UnityEngine.XR.ARSubsystems;

public class PlacementIndicator : MonoBehaviour
{
    public GameObject gameCube;
    public GameObject placementIndicator;

    private ARRaycastManager arRaycastManager;
    private Pose placementPose;
    private bool placementPoseIsValid;

    void Start()
    {
        arRaycastManager = FindObjectOfType<ARRaycastManager>();
    }

    void Update()
    {
        // P‰ivitet‰‰n asetusindikaattoria koko ajan
        UpdatePlacementPose();
        UpdatePlacementIndicator();

        // Asetetaan pelikentt‰ jos pelaaja t‰pp‰si n‰yttˆ‰ ja asetusindikaattori oli hyv‰ksytyss‰ paikassa
        if (placementPoseIsValid && Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
        {
            PlaceGameField();
        }
    }

    // Asettaa objektit pelikent‰lle indikaattorin sijaintiin
    private void PlaceGameField()
    {
        // Luo kolme palikkaa pelikent‰ksi indikaattorin sijaintiin
        Instantiate(gameCube, placementPose.position + new Vector3(-0.3f, 0, 0), placementPose.rotation);
        Instantiate(gameCube, placementPose.position, placementPose.rotation);
        Instantiate(gameCube, placementPose.position + new Vector3(0.3f, 0, 0), placementPose.rotation);

        // Piilottaa indikaattorin ja disablaa skriptin ettei voi toista pelikentt‰‰ luoda
        placementIndicator.SetActive(false);
        enabled = false;
    }

    // P‰ivitt‰‰ indikaattorin sijainnin ja n‰kyvyyden
    private void UpdatePlacementIndicator()
    {
        // Asetetaan indikaattorin n‰kyvyys sen mukaan, onko sen hetkinen Pose hyv‰ksytty
        placementIndicator.SetActive(placementPoseIsValid);
        // Siirret‰‰n indikaattori placementPosen sijaintiin
        placementIndicator.transform.SetPositionAndRotation(placementPose.position, placementPose.rotation);
    }

    // P‰ivitet‰‰n kameran osoittama sijainti
    private void UpdatePlacementPose()
    {
        // Raycast ruudun keskelt‰
        var screenCenter = Camera.current.ViewportToScreenPoint(new Vector3(0.5f, 0.5f));
        var hits = new List<ARRaycastHit>();
        arRaycastManager.Raycast(screenCenter, hits);

        // Asetetaan sijainti hyv‰ksytyksi, jos raycast osui mihink‰‰n
        placementPoseIsValid = hits.Count > 0;

        // Asetetaan placementPoseen ensimm‰inen osuttu objekti
        if (placementPoseIsValid)
        {
            placementPose = hits[0].pose;
            var cameraForward = Camera.current.transform.forward;
            var cameraBearing = new Vector3(cameraForward.x, 0, cameraForward.z).normalized;
            placementPose.rotation = Quaternion.LookRotation(cameraBearing);
        }
    }
}
